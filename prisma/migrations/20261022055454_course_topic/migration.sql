-- CreateTable
CREATE TABLE `CourseTopic` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `courseId` INTEGER NOT NULL,
    `title` VARCHAR(160) NOT NULL,
    `summary` TEXT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CourseTopic_courseId_position_idx`(`courseId`, `position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lesson` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `topicId` INTEGER NOT NULL,
    `title` VARCHAR(160) NOT NULL,
    `type` ENUM('VIDEO', 'TEXT', 'LIVE') NOT NULL DEFAULT 'VIDEO',
    `content` TEXT NULL,
    `videoUrl` VARCHAR(500) NULL,
    `liveUrl` VARCHAR(500) NULL,
    `liveStartsAt` DATETIME(3) NULL,
    `durationMin` INTEGER NULL,
    `isPreview` BOOLEAN NOT NULL DEFAULT false,
    `isPublished` BOOLEAN NOT NULL DEFAULT true,
    `position` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Lesson_topicId_position_idx`(`topicId`, `position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CourseTopic` ADD CONSTRAINT `CourseTopic_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lesson` ADD CONSTRAINT `Lesson_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `CourseTopic`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
