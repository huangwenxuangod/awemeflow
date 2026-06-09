import { randomUUID } from 'crypto';
import { getDb } from '@/db';
import { creditTransaction, payment, user, userCredit } from '@/db/schema';
import { findPlanByPriceId, getAllPricePlans } from '@/lib/price-plan';
import { PlanIntervals } from '@/payment/types';
import { addDays } from 'date-fns';
import { and, eq, gt, isNull, lt, not, or, sql } from 'drizzle-orm';
import type { BatchItem } from 'drizzle-orm/batch';
import { canAddCreditsByType } from './credits';
import { CREDIT_TRANSACTION_TYPE } from './types';

// Type for batch statements
type BatchStatements = BatchItem<'sqlite'>[];

/**
 * Distribute credits to all users based on their plan type
 * This function is designed to be called by a cron job
 */
export async function distributeCreditsToAllUsers() {
  console.log('>>> distribute credits start');

  // Process expired credits first before distributing new credits
  console.log('Processing expired credits before distribution...');
  const expiredResult = await batchProcessExpiredCredits();
  console.log('Expired credits processed:', expiredResult);

  const db = await getDb();

  // Get all users with their current active payments/subscriptions in a single query
  // This uses a LEFT JOIN to get users and their latest active payment in one query
  const latestPaymentQuery = db
    .select({
      userId: payment.userId,
      priceId: payment.priceId,
      status: payment.status,
      paid: payment.paid,
      createdAt: payment.createdAt,
      rowNumber:
        sql<number>`ROW_NUMBER() OVER (PARTITION BY ${payment.userId} ORDER BY ${payment.createdAt} DESC)`.as(
          'row_number'
        ),
    })
    .from(payment)
    .where(
      or(
        // Active subscriptions
        and(eq(payment.status, 'active'), eq(payment.paid, true)),
        // Trial subscriptions
        and(eq(payment.status, 'trialing'), eq(payment.paid, true)),
        // Completed lifetime payments
        and(eq(payment.status, 'completed'), eq(payment.paid, true))
      )
    )
    .as('latest_payment');

  const usersWithPayments = await db
    .select({
      userId: user.id,
      email: user.email,
      name: user.name,
      priceId: latestPaymentQuery.priceId,
      paymentPaid: latestPaymentQuery.paid,
      paymentStatus: latestPaymentQuery.status,
      paymentCreatedAt: latestPaymentQuery.createdAt,
    })
    .from(user)
    .leftJoin(
      latestPaymentQuery,
      and(
        eq(user.id, latestPaymentQuery.userId),
        eq(latestPaymentQuery.rowNumber, 1)
      )
    )
    .where(or(isNull(user.banned), eq(user.banned, false)));

  console.log('distribute credits, users count:', usersWithPayments.length);

  const usersCount = usersWithPayments.length;
  let processedCount = 0;
  let errorCount = 0;

  // Separate users by their plan type for batch processing
  const freeUserIds: string[] = [];
  const lifetimeUsers: Array<{ userId: string; priceId: string }> = [];
  const yearlyUsers: Array<{ userId: string; priceId: string }> = [];

  usersWithPayments.forEach((userRecord) => {
    // Check if user has valid payment (active subscription or completed lifetime payment)
    if (
      userRecord.priceId &&
      userRecord.paymentPaid &&
      userRecord.paymentStatus &&
      (userRecord.paymentStatus === 'active' ||
        userRecord.paymentStatus === 'trialing' ||
        userRecord.paymentStatus === 'completed')
    ) {
      // User has valid payment - check what type
      const pricePlan = findPlanByPriceId(userRecord.priceId);
      if (pricePlan?.isLifetime && pricePlan?.credits?.enable) {
        lifetimeUsers.push({
          userId: userRecord.userId,
          priceId: userRecord.priceId,
        });
      } else if (!pricePlan?.isFree && pricePlan?.credits?.enable) {
        // Check if this is a yearly subscription that needs monthly credits
        const yearlyPrice = pricePlan?.prices?.find(
          (p) =>
            p.priceId === userRecord.priceId &&
            p.interval === PlanIntervals.YEAR
        );
        if (yearlyPrice) {
          yearlyUsers.push({
            userId: userRecord.userId,
            priceId: userRecord.priceId,
          });
        }
        // Monthly subscriptions are handled by Stripe webhooks automatically
      }
    } else {
      // User has no valid payment - add free monthly credits if enabled
      freeUserIds.push(userRecord.userId);
    }
  });

  console.log(
    `distribute credits, lifetime users: ${lifetimeUsers.length}, free users: ${freeUserIds.length}, yearly users: ${yearlyUsers.length}`
  );

  // Process free users one by one
  for (let i = 0; i < freeUserIds.length; i++) {
    const userId = freeUserIds[i];
    try {
      await addMonthlyFreeCreditsForUser(userId);
      processedCount++;
    } catch (error) {
      console.error(
        `addMonthlyFreeCreditsForUser error for user ${userId}:`,
        error
      );
      errorCount++;
    }

    // Log progress for large datasets
    if (freeUserIds.length > 100 && (i + 1) % 100 === 0) {
      console.log(`free credits progress: ${i + 1}/${freeUserIds.length}`);
    }
  }

  // Process lifetime users one by one
  for (let i = 0; i < lifetimeUsers.length; i++) {
    const { userId, priceId } = lifetimeUsers[i];
    try {
      await addLifetimeMonthlyCreditsForUser(userId, priceId);
      processedCount++;
    } catch (error) {
      console.error(
        `addLifetimeMonthlyCreditsForUser error for user ${userId}:`,
        error
      );
      errorCount++;
    }

    // Log progress for large datasets
    if (lifetimeUsers.length > 100 && (i + 1) % 100 === 0) {
      console.log(
        `lifetime credits progress: ${i + 1}/${lifetimeUsers.length}`
      );
    }
  }

  // Process yearly subscription users one by one
  for (let i = 0; i < yearlyUsers.length; i++) {
    const { userId, priceId } = yearlyUsers[i];
    try {
      await addYearlyUserMonthlyCreditsForUser(userId, priceId);
      processedCount++;
    } catch (error) {
      console.error(
        `addYearlyUserMonthlyCreditsForUser error for user ${userId}:`,
        error
      );
      errorCount++;
    }

    // Log progress for large datasets
    if (yearlyUsers.length > 100 && (i + 1) % 100 === 0) {
      console.log(
        `yearly subscription credits progress: ${i + 1}/${yearlyUsers.length}`
      );
    }
  }

  console.log(
    `<<< distribute credits end, users: ${usersCount}, processed: ${processedCount}, errors: ${errorCount}`
  );
  return { usersCount, processedCount, errorCount };
}

/**
 * Execute batch statements if there are any
 * Helper function to handle the tuple type requirement of db.batch()
 */
async function executeBatch(
  db: Awaited<ReturnType<typeof getDb>>,
  statements: BatchStatements
) {
  if (statements.length === 0) return;
  // Cast to tuple type as required by db.batch()
  await db.batch(
    statements as unknown as [BatchItem<'sqlite'>, ...BatchItem<'sqlite'>[]]
  );
}

/**
 * Add monthly free credits for a single user
 * Uses db.batch() for Cloudflare D1 compatibility (D1 batch is atomic/transactional)
 * @param userId - User ID
 */
export async function addMonthlyFreeCreditsForUser(userId: string) {
  // NOTICE: make sure the free plan is not disabled and has credits enabled
  const pricePlans = getAllPricePlans();
  const freePlan = pricePlans.find(
    (plan) =>
      plan.isFree &&
      !plan.disabled &&
      plan.credits?.enable &&
      plan.credits?.amount > 0
  );
  if (!freePlan) {
    return;
  }

  const db = await getDb();
  const now = new Date();
  const credits = freePlan.credits?.amount || 0;
  const expireDays = freePlan.credits?.expireDays || 0;

  // Check if user can receive credits
  const canAdd = await canAddCreditsByType(
    userId,
    CREDIT_TRANSACTION_TYPE.MONTHLY_REFRESH
  );
  if (!canAdd) {
    return;
  }

  // Get current user credit record
  const currentUserCredit = await db
    .select()
    .from(userCredit)
    .where(eq(userCredit.userId, userId))
    .limit(1);

  const expirationDate = expireDays ? addDays(now, expireDays) : undefined;

  // Build batch statements
  const batchStatements: BatchStatements = [];

  // Insert credit transaction
  batchStatements.push(
    db.insert(creditTransaction).values({
      id: randomUUID(),
      userId,
      type: CREDIT_TRANSACTION_TYPE.MONTHLY_REFRESH,
      amount: credits,
      remainingAmount: credits,
      description: `Free monthly credits: ${credits} for ${now.getFullYear()}-${now.getMonth() + 1}`,
      expirationDate,
      createdAt: now,
      updatedAt: now,
    })
  );

  if (currentUserCredit.length > 0) {
    // Update existing user credit record
    const newBalance = (currentUserCredit[0].currentCredits || 0) + credits;
    batchStatements.push(
      db
        .update(userCredit)
        .set({
          currentCredits: newBalance,
          updatedAt: now,
        })
        .where(eq(userCredit.userId, userId))
    );
  } else {
    // Insert new user credit record
    batchStatements.push(
      db.insert(userCredit).values({
        id: randomUUID(),
        userId,
        currentCredits: credits,
        createdAt: now,
        updatedAt: now,
      })
    );
  }

  // Execute batch (atomic operation in D1)
  await executeBatch(db, batchStatements);
}

/**
 * Add lifetime monthly credits for a single user
 * Uses db.batch() for Cloudflare D1 compatibility (D1 batch is atomic/transactional)
 * @param userId - User ID
 * @param priceId - Price ID of the lifetime plan
 */
export async function addLifetimeMonthlyCreditsForUser(
  userId: string,
  priceId: string
) {
  const pricePlan = findPlanByPriceId(priceId);
  if (
    !pricePlan ||
    !pricePlan.isLifetime ||
    !pricePlan.credits?.enable ||
    !pricePlan.credits?.amount
  ) {
    return;
  }

  const db = await getDb();
  const now = new Date();
  const credits = pricePlan.credits.amount;
  const expireDays = pricePlan.credits.expireDays;

  // Check if user can receive credits
  const canAdd = await canAddCreditsByType(
    userId,
    CREDIT_TRANSACTION_TYPE.LIFETIME_MONTHLY
  );
  if (!canAdd) {
    return;
  }

  // Get current user credit record
  const currentUserCredit = await db
    .select()
    .from(userCredit)
    .where(eq(userCredit.userId, userId))
    .limit(1);

  const expirationDate = expireDays ? addDays(now, expireDays) : undefined;

  // Build batch statements
  const batchStatements: BatchStatements = [];

  // Insert credit transaction
  batchStatements.push(
    db.insert(creditTransaction).values({
      id: randomUUID(),
      userId,
      type: CREDIT_TRANSACTION_TYPE.LIFETIME_MONTHLY,
      amount: credits,
      remainingAmount: credits,
      description: `Lifetime monthly credits: ${credits} for ${now.getFullYear()}-${now.getMonth() + 1}`,
      expirationDate,
      createdAt: now,
      updatedAt: now,
    })
  );

  if (currentUserCredit.length > 0) {
    // Update existing user credit record
    const newBalance = (currentUserCredit[0].currentCredits || 0) + credits;
    batchStatements.push(
      db
        .update(userCredit)
        .set({
          currentCredits: newBalance,
          updatedAt: now,
        })
        .where(eq(userCredit.userId, userId))
    );
  } else {
    // Insert new user credit record
    batchStatements.push(
      db.insert(userCredit).values({
        id: randomUUID(),
        userId,
        currentCredits: credits,
        createdAt: now,
        updatedAt: now,
      })
    );
  }

  // Execute batch (atomic operation in D1)
  await executeBatch(db, batchStatements);
}

/**
 * Add monthly credits for a single yearly subscription user
 * Uses db.batch() for Cloudflare D1 compatibility (D1 batch is atomic/transactional)
 * @param userId - User ID
 * @param priceId - Price ID of the yearly subscription
 */
export async function addYearlyUserMonthlyCreditsForUser(
  userId: string,
  priceId: string
) {
  const pricePlan = findPlanByPriceId(priceId);
  if (!pricePlan || !pricePlan.credits || !pricePlan.credits.enable) {
    return;
  }

  const db = await getDb();
  const now = new Date();
  const credits = pricePlan.credits.amount;
  const expireDays = pricePlan.credits.expireDays;

  // Check if user can receive credits
  const canAdd = await canAddCreditsByType(
    userId,
    CREDIT_TRANSACTION_TYPE.SUBSCRIPTION_RENEWAL
  );
  if (!canAdd) {
    return;
  }

  // Get current user credit record
  const currentUserCredit = await db
    .select()
    .from(userCredit)
    .where(eq(userCredit.userId, userId))
    .limit(1);

  const expirationDate = expireDays ? addDays(now, expireDays) : undefined;

  // Build batch statements
  const batchStatements: BatchStatements = [];

  // Insert credit transaction
  batchStatements.push(
    db.insert(creditTransaction).values({
      id: randomUUID(),
      userId,
      type: CREDIT_TRANSACTION_TYPE.SUBSCRIPTION_RENEWAL,
      amount: credits,
      remainingAmount: credits,
      description: `Yearly subscription monthly credits: ${credits} for ${now.getFullYear()}-${now.getMonth() + 1}`,
      expirationDate,
      createdAt: now,
      updatedAt: now,
    })
  );

  if (currentUserCredit.length > 0) {
    // Update existing user credit record
    const newBalance = (currentUserCredit[0].currentCredits || 0) + credits;
    batchStatements.push(
      db
        .update(userCredit)
        .set({
          currentCredits: newBalance,
          updatedAt: now,
        })
        .where(eq(userCredit.userId, userId))
    );
  } else {
    // Insert new user credit record
    batchStatements.push(
      db.insert(userCredit).values({
        id: randomUUID(),
        userId,
        currentCredits: credits,
        createdAt: now,
        updatedAt: now,
      })
    );
  }

  // Execute batch (atomic operation in D1)
  await executeBatch(db, batchStatements);
}

/**
 * Batch process expired credits for all users
 * This function is designed to be called by a cron job
 */
export async function batchProcessExpiredCredits() {
  console.log('>>> batch process expired credits start');

  const db = await getDb();
  const now = new Date();

  // Get all users who have credit transactions that can expire
  const usersWithExpirableCredits = await db
    .selectDistinct({
      userId: creditTransaction.userId,
    })
    .from(creditTransaction)
    .where(
      and(
        // Exclude usage and expire records (these are consumption/expiration logs)
        not(eq(creditTransaction.type, CREDIT_TRANSACTION_TYPE.USAGE)),
        not(eq(creditTransaction.type, CREDIT_TRANSACTION_TYPE.EXPIRE)),
        // Only include transactions with expirationDate set
        not(isNull(creditTransaction.expirationDate)),
        // Only include transactions not yet processed for expiration
        isNull(creditTransaction.expirationDateProcessedAt),
        // Only include transactions with remaining amount > 0
        gt(creditTransaction.remainingAmount, 0),
        // Only include expired transactions
        lt(creditTransaction.expirationDate, now)
      )
    );

  console.log(
    'batch process expired credits, users count:',
    usersWithExpirableCredits.length
  );

  const usersCount = usersWithExpirableCredits.length;
  let processedCount = 0;
  let errorCount = 0;
  let totalExpiredCredits = 0;

  // Process users one by one
  for (let i = 0; i < usersWithExpirableCredits.length; i++) {
    const { userId } = usersWithExpirableCredits[i];
    try {
      const result = await processExpiredCreditsForUser(userId);
      processedCount++;
      totalExpiredCredits += result.expiredCredits;
    } catch (error) {
      console.error(
        `processExpiredCreditsForUser error for user ${userId}:`,
        error
      );
      errorCount++;
    }

    // Log progress for large datasets
    if (usersWithExpirableCredits.length > 100 && (i + 1) % 100 === 0) {
      console.log(
        `expired credits progress: ${i + 1}/${usersWithExpirableCredits.length}`
      );
    }
  }

  console.log(
    `<<< batch process expired credits end, users: ${usersCount}, processed: ${processedCount}, errors: ${errorCount}, total expired credits: ${totalExpiredCredits}`
  );
  return { usersCount, processedCount, errorCount, totalExpiredCredits };
}

/**
 * Process expired credits for a single user
 * Uses db.batch() for Cloudflare D1 compatibility (D1 batch is atomic/transactional)
 * @param userId - User ID
 */
export async function processExpiredCreditsForUser(userId: string) {
  const db = await getDb();
  const now = new Date();

  // Get all expired transactions for this user
  const expiredTransactions = await db
    .select()
    .from(creditTransaction)
    .where(
      and(
        eq(creditTransaction.userId, userId),
        // Exclude usage and expire records (these are consumption/expiration logs)
        not(eq(creditTransaction.type, CREDIT_TRANSACTION_TYPE.USAGE)),
        not(eq(creditTransaction.type, CREDIT_TRANSACTION_TYPE.EXPIRE)),
        // Only include transactions with expirationDate set
        not(isNull(creditTransaction.expirationDate)),
        // Only include transactions not yet processed for expiration
        isNull(creditTransaction.expirationDateProcessedAt),
        // Only include transactions with remaining amount > 0
        gt(creditTransaction.remainingAmount, 0),
        // Only include expired transactions
        lt(creditTransaction.expirationDate, now)
      )
    );

  // Calculate total expired credits
  let expiredTotal = 0;
  for (const transaction of expiredTransactions) {
    const remain = transaction.remainingAmount || 0;
    if (remain > 0) {
      expiredTotal += remain;
    }
  }

  if (expiredTotal === 0) {
    return { expiredCredits: 0 };
  }

  // Get current user credit balance
  const currentUserCredit = await db
    .select()
    .from(userCredit)
    .where(eq(userCredit.userId, userId))
    .limit(1);

  const newBalance = Math.max(
    0,
    (currentUserCredit[0]?.currentCredits || 0) - expiredTotal
  );

  // Build batch statements
  const batchStatements: BatchStatements = [];

  // Update all expired transactions to mark them as processed
  for (const transaction of expiredTransactions) {
    if ((transaction.remainingAmount || 0) > 0) {
      batchStatements.push(
        db
          .update(creditTransaction)
          .set({
            remainingAmount: 0,
            expirationDateProcessedAt: now,
            updatedAt: now,
          })
          .where(eq(creditTransaction.id, transaction.id))
      );
    }
  }

  // Update user credit balance
  batchStatements.push(
    db
      .update(userCredit)
      .set({
        currentCredits: newBalance,
        updatedAt: now,
      })
      .where(eq(userCredit.userId, userId))
  );

  // Insert expire record
  batchStatements.push(
    db.insert(creditTransaction).values({
      id: randomUUID(),
      userId,
      type: CREDIT_TRANSACTION_TYPE.EXPIRE,
      amount: -expiredTotal,
      remainingAmount: null,
      description: `Expire credits: ${expiredTotal}`,
      createdAt: now,
      updatedAt: now,
    })
  );

  // Execute batch (atomic operation in D1)
  await executeBatch(db, batchStatements);

  console.log(
    `processExpiredCreditsForUser, ${expiredTotal} credits expired for user ${userId}`
  );

  return { expiredCredits: expiredTotal };
}

// Legacy batch functions for backward compatibility
// These now just call the single-user functions

/**
 * @deprecated Use addMonthlyFreeCreditsForUser instead
 */
export async function batchAddMonthlyFreeCredits(userIds: string[]) {
  for (const userId of userIds) {
    await addMonthlyFreeCreditsForUser(userId);
  }
}

/**
 * @deprecated Use addLifetimeMonthlyCreditsForUser instead
 */
export async function batchAddLifetimeMonthlyCredits(
  users: Array<{ userId: string; priceId: string }>
) {
  for (const { userId, priceId } of users) {
    await addLifetimeMonthlyCreditsForUser(userId, priceId);
  }
}

/**
 * @deprecated Use addYearlyUserMonthlyCreditsForUser instead
 */
export async function batchAddYearlyUsersMonthlyCredits(
  users: Array<{ userId: string; priceId: string }>
) {
  for (const { userId, priceId } of users) {
    await addYearlyUserMonthlyCreditsForUser(userId, priceId);
  }
}

/**
 * @deprecated Use processExpiredCreditsForUser instead
 */
export async function batchProcessExpiredCreditsForUsers(userIds: string[]) {
  let totalProcessedCount = 0;
  let totalExpiredCredits = 0;

  for (const userId of userIds) {
    const result = await processExpiredCreditsForUser(userId);
    totalProcessedCount++;
    totalExpiredCredits += result.expiredCredits;
  }

  return {
    processedCount: totalProcessedCount,
    expiredCredits: totalExpiredCredits,
  };
}
