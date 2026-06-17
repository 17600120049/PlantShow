-- Consolidate Plant.photoUrl into photos JSON array, then drop redundant column
UPDATE `Plant`
SET `photos` = JSON_ARRAY(`photoUrl`)
WHERE `photoUrl` IS NOT NULL
  AND (`photos` IS NULL OR JSON_LENGTH(`photos`) = 0);

ALTER TABLE `Plant` DROP COLUMN `photoUrl`;
