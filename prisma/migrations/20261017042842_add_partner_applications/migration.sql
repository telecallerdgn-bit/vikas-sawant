-- CreateTable
CREATE TABLE `PartnerApplication` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `mobile` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `panMasked` VARCHAR(191) NULL,
    `experience` TEXT NOT NULL,
    `districtId` INTEGER NULL,
    `sponsorId` INTEGER NULL,
    `status` ENUM('SUBMITTED', 'UNDER_REVIEW', 'MORE_INFO', 'APPROVED', 'REJECTED', 'ACTIVE') NOT NULL DEFAULT 'SUBMITTED',
    `note` TEXT NULL,
    `feePaid` BOOLEAN NOT NULL DEFAULT false,
    `feePaidAt` DATETIME(3) NULL,
    `userId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PartnerApplication_userId_key`(`userId`),
    INDEX `PartnerApplication_email_idx`(`email`),
    INDEX `PartnerApplication_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PartnerApplication` ADD CONSTRAINT `PartnerApplication_districtId_fkey` FOREIGN KEY (`districtId`) REFERENCES `District`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartnerApplication` ADD CONSTRAINT `PartnerApplication_sponsorId_fkey` FOREIGN KEY (`sponsorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartnerApplication` ADD CONSTRAINT `PartnerApplication_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
