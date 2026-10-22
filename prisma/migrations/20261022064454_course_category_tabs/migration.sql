-- AlterTable
ALTER TABLE `course` ADD COLUMN `categoryId` INTEGER NULL,
    ADD COLUMN `eligibility` TEXT NULL,
    ADD COLUMN `keyBenefits` TEXT NULL,
    ADD COLUMN `overview` TEXT NULL;

-- CreateTable
CREATE TABLE `CourseCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(120) NOT NULL,
    `slug` VARCHAR(140) NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CourseCategory_name_key`(`name`),
    UNIQUE INDEX `CourseCategory_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Course_categoryId_idx` ON `Course`(`categoryId`);

-- AddForeignKey
ALTER TABLE `Course` ADD CONSTRAINT `Course_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `CourseCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
