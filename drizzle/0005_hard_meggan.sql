CREATE TABLE `errorLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`errorMessage` text NOT NULL,
	`errorStack` text,
	`errorType` varchar(100) NOT NULL DEFAULT 'unknown',
	`userAgent` text,
	`url` text,
	`ipAddress` varchar(45),
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`isResolved` int NOT NULL DEFAULT 0,
	`resolvedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `errorLogs_id` PRIMARY KEY(`id`)
);
