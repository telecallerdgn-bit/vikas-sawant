-- CreateTable
CREATE TABLE `CommissionRuleVersion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `version` INTEGER NOT NULL,
    `level1Percent` DECIMAL(5, 2) NOT NULL,
    `level2Percent` DECIMAL(5, 2) NOT NULL,
    `level3Percent` DECIMAL(5, 2) NOT NULL,
    `level4Percent` DECIMAL(5, 2) NOT NULL,
    `level5Percent` DECIMAL(5, 2) NOT NULL,
    `districtPercent` DECIMAL(5, 2) NOT NULL,
    `subSuperPercent` DECIMAL(5, 2) NOT NULL,
    `subSuperBase` ENUM('REMAINDER', 'DISTRIBUTABLE') NOT NULL DEFAULT 'REMAINDER',
    `inactiveRule` ENUM('SKIP_TO_SUPER_ADMIN', 'COMPRESS') NOT NULL DEFAULT 'SKIP_TO_SUPER_ADMIN',
    `gatewayMode` ENUM('DEDUCT_FIRST', 'SUPER_ADMIN_BEARS') NOT NULL DEFAULT 'DEDUCT_FIRST',
    `gstPercent` DECIMAL(5, 2) NOT NULL DEFAULT 18,
    `gatewayFeePercent` DECIMAL(5, 2) NOT NULL DEFAULT 2,
    `note` VARCHAR(200) NULL,
    `createdById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `approvedById` INTEGER NULL,
    `approvedAt` DATETIME(3) NULL,

    UNIQUE INDEX `CommissionRuleVersion_version_key`(`version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
