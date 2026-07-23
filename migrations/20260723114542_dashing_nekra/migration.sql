CREATE TABLE `posts` (
	`id` integer PRIMARY KEY,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`user_id` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	CONSTRAINT `fk_posts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY,
	`name` text NOT NULL,
	`age` integer NOT NULL,
	`email` text NOT NULL UNIQUE
);
