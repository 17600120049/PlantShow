-- CreateTable
CREATE TABLE `StationApplication` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `applicantName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `stationName` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `hours` VARCHAR(191) NULL,
    `intro` TEXT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `reviewNote` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `StationApplication_status_idx`(`status`),
    INDEX `StationApplication_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StationApplication` ADD CONSTRAINT `StationApplication_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
