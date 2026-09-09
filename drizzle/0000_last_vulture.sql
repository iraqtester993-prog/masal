CREATE TABLE `audit` (
	`id` text PRIMARY KEY NOT NULL,
	`record_id` text NOT NULL,
	`module` text NOT NULL,
	`action` text NOT NULL,
	`before_data` text NOT NULL,
	`after_data` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `records` (
	`id` text PRIMARY KEY NOT NULL,
	`module` text NOT NULL,
	`data` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL
);
