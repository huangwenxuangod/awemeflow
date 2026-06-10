'use client';

import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { useLocalePathname } from '@/i18n/navigation';
import type { ReactNode } from 'react';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  const pathname = useLocalePathname();
  const isHome = pathname === '/';

  return (
    <div className="flex flex-col min-h-screen">
      {!isHome ? <Navbar scroll={true} /> : null}
      <main className="flex-1">{children}</main>
      {!isHome ? <Footer /> : null}
    </div>
  );
}
