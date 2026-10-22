-- AlterTable
ALTER TABLE `course` ADD COLUMN `offerEndsAt` DATETIME(3) NULL,
    ADD COLUMN `offerLabel` VARCHAR(80) NULL,
    ADD COLUMN `offerPrice` DECIMAL(10, 2) NULL;
