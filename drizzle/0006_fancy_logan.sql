CREATE TABLE `healthChecks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`status` enum('online','offline') NOT NULL DEFAULT 'online',
	`responseTime` int,
	`lastAlertSent` timestamp,
	`alertCount` int NOT NULL DEFAULT 0,
	`isAlertActive` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `healthChecks_id` PRIMARY KEY(`id`)
);
