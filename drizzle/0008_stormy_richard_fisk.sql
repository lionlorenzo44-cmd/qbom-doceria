ALTER TABLE `errorLogs` MODIFY COLUMN `url` text NOT NULL DEFAULT ('');--> statement-breakpoint
ALTER TABLE `errorLogs` MODIFY COLUMN `ipAddress` varchar(45) NOT NULL DEFAULT '';