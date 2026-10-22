/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Course` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `course` ADD COLUMN `coverImage` VARCHAR(500) NULL,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `slug` VARCHAR(191) NULL,
    ADD COLUMN `summary` VARCHAR(300) NULL,
    MODIFY `mode` ENUM('LIVE_STUDY', 'HYBRID', 'STUDY_ONLY', 'ONLINE_PRERECORDED', 'LIVE_ONLY') NOT NULL;

-- AlterTable
ALTER TABLE `order` ADD COLUMN `mode` ENUM('LIVE_STUDY', 'HYBRID', 'STUDY_ONLY', 'ONLINE_PRERECORDED', 'LIVE_ONLY') NULL;

-- CreateTable
CREATE TABLE `CoursePrice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `courseId` INTEGER NOT NULL,
    `mode` ENUM('LIVE_STUDY', 'HYBRID', 'STUDY_ONLY', 'ONLINE_PRERECORDED', 'LIVE_ONLY') NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,

    UNIQUE INDEX `CoursePrice_courseId_mode_key`(`courseId`, `mode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlogPost` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `excerpt` VARCHAR(300) NULL,
    `content` LONGTEXT NOT NULL,
    `coverImage` VARCHAR(500) NULL,
    `status` ENUM('DRAFT', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `authorName` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BlogPost_slug_key`(`slug`),
    INDEX `BlogPost_status_publishedAt_idx`(`status`, `publishedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Course_slug_key` ON `Course`(`slug`);

-- AddForeignKey
ALTER TABLE `CoursePrice` ADD CONSTRAINT `CoursePrice_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
