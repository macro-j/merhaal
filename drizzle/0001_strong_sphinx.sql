CREATE TABLE `accommodations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`destinationId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`type` enum('فاخر','متوسط','اقتصادي','شقق مفروشة','استراحات') NOT NULL,
	`pricePerNight` decimal(10,2) NOT NULL,
	`rating` decimal(2,1),
	`link` varchar(500),
	`features` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `accommodations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`destinationId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`type` varchar(100) NOT NULL,
	`duration` varchar(50),
	`cost` decimal(10,2) DEFAULT '0',
	`icon` varchar(50),
	`minTier` enum('free','smart','professional') NOT NULL DEFAULT 'free',
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `destinations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nameAr` varchar(100) NOT NULL,
	`nameEn` varchar(100) NOT NULL,
	`titleAr` varchar(200) NOT NULL,
	`titleEn` varchar(200) NOT NULL,
	`descriptionAr` text NOT NULL,
	`descriptionEn` text NOT NULL,
	`images` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `destinations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`itemType` enum('destination','activity','accommodation','restaurant') NOT NULL,
	`itemId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `restaurants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`destinationId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`cuisine` varchar(100) NOT NULL,
	`priceRange` enum('فاخر','متوسط','اقتصادي') NOT NULL,
	`avgPrice` decimal(10,2) NOT NULL,
	`rating` decimal(2,1),
	`specialties` json,
	`trending` varchar(200),
	`location` varchar(200),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `restaurants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`destinationId` int NOT NULL,
	`days` int NOT NULL,
	`budget` decimal(10,2) NOT NULL,
	`interests` json NOT NULL,
	`accommodationType` varchar(50),
	`plan` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trips_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `tier` enum('free','smart','professional') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `city` varchar(100);