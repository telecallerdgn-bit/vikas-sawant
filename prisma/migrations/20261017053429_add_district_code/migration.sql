/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `District` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `district` ADD COLUMN `code` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `District_code_key` ON `District`(`code`);
