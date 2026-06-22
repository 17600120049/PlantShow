-- AlterTable
ALTER TABLE `Station` ADD COLUMN `hoursMode` ENUM('FIXED', 'FLEXIBLE') NOT NULL DEFAULT 'FIXED';

-- CreateTable
CREATE TABLE `StationManager` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `stationId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `StationManager_userId_idx`(`userId`),
    INDEX `StationManager_stationId_idx`(`stationId`),
    UNIQUE INDEX `StationManager_userId_stationId_key`(`userId`, `stationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StationManager` ADD CONSTRAINT `StationManager_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StationManager` ADD CONSTRAINT `StationManager_stationId_fkey` FOREIGN KEY (`stationId`) REFERENCES `Station`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
