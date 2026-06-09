ALTER TABLE `user` ADD `normalized_email` text;--> statement-breakpoint
CREATE UNIQUE INDEX `user_normalized_email_unique` ON `user` (`normalized_email`);