-- Add fields for referral and points unlock system
ALTER TABLE `User` ADD COLUMN `inviteUnlocked` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `User` ADD COLUMN `referralCode` VARCHAR(191) NOT NULL UNIQUE;
ALTER TABLE `User` ADD COLUMN `referredById` VARCHAR(191) NULL;

-- Add self-referential relation for referral system
ALTER TABLE `User` ADD CONSTRAINT `User_referredById_fkey` FOREIGN KEY (`referredById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Create index for faster referral code lookup
CREATE INDEX `User_referralCode_idx` ON `User`(`referralCode`);
CREATE INDEX `User_referredById_idx` ON `User`(`referredById`);