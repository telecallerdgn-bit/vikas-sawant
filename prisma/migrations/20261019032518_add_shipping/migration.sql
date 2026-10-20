/*
  Warnings:

  - You are about to drop the column `code` on the `district` table. All the data in the column will be lost.
  - You are about to drop the column `payoutId` on the `ledgerentry` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `shipment` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(5))`.
  - You are about to drop the `payout` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[awb]` on the table `Shipment` will be added. If there are existing duplicate values, this will fail.
  - Made the column `orderId` on table `ledgerentry` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `ledgerentry` DROP FOREIGN KEY `LedgerEntry_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `ledgerentry` DROP FOREIGN KEY `LedgerEntry_payoutId_fkey`;

-- DropForeignKey
ALTER TABLE `payout` DROP FOREIGN KEY `Payout_reviewedById_fkey`;

-- DropForeignKey
ALTER TABLE `payout` DROP FOREIGN KEY `Payout_userId_fkey`;

-- DropIndex
DROP INDEX `District_code_key` ON `district`;

-- DropIndex
DROP INDEX `LedgerEntry_orderId_fkey` ON `ledgerentry`;

-- DropIndex
DROP INDEX `LedgerEntry_payoutId_fkey` ON `ledgerentry`;

-- AlterTable
ALTER TABLE `district` DROP COLUMN `code`;

-- AlterTable
ALTER TABLE `ledgerentry` DROP COLUMN `payoutId`,
    MODIFY `orderId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `shipment` ADD COLUMN `awb` VARCHAR(191) NULL,
    ADD COLUMN `courier` VARCHAR(191) NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `packedAt` DATETIME(3) NULL,
    ADD COLUMN `packedById` INTEGER NULL,
    ADD COLUMN `weightGrams` INTEGER NULL,
    MODIFY `status` ENUM('AWAITING_PACKING', 'PACKED', 'LABEL_GENERATED', 'DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELIVERY_FAILED', 'RETURNED') NOT NULL DEFAULT 'AWAITING_PACKING';

-- AlterTable
ALTER TABLE `student` ADD COLUMN `addressLine` VARCHAR(191) NULL,
    ADD COLUMN `city` VARCHAR(191) NULL,
    ADD COLUMN `pincode` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `payout`;

-- CreateTable
CREATE TABLE `ShipmentEvent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `shipmentId` INTEGER NOT NULL,
    `status` ENUM('AWAITING_PACKING', 'PACKED', 'LABEL_GENERATED', 'DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELIVERY_FAILED', 'RETURNED') NOT NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ShipmentEvent_shipmentId_idx`(`shipmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Shipment_awb_key` ON `Shipment`(`awb`);

-- AddForeignKey
ALTER TABLE `LedgerEntry` ADD CONSTRAINT `LedgerEntry_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shipment` ADD CONSTRAINT `Shipment_packedById_fkey` FOREIGN KEY (`packedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShipmentEvent` ADD CONSTRAINT `ShipmentEvent_shipmentId_fkey` FOREIGN KEY (`shipmentId`) REFERENCES `Shipment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
