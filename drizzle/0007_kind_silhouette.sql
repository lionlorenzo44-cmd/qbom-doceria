CREATE TABLE `recoveryWebhooks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`url` varchar(2048) NOT NULL,
	`method` enum('GET','POST','PUT') NOT NULL DEFAULT 'POST',
	`headers` json,
	`payload` json,
	`isActive` int NOT NULL DEFAULT 1,
	`lastExecuted` timestamp,
	`lastStatus` int,
	`failureCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recoveryWebhooks_id` PRIMARY KEY(`id`)
);
