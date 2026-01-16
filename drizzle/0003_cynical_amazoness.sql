ALTER TABLE `activities` ADD `nameEn` varchar(200);--> statement-breakpoint
ALTER TABLE `activities` ADD `isActive` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `destinations` ADD `slug` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `destinations` ADD `isActive` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `destinations` ADD CONSTRAINT `destinations_slug_unique` UNIQUE(`slug`);