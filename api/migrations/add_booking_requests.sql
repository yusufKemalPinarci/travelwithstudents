-- Migration: Add BookingRequest Model
-- Generated: 2026-01-30

-- Create booking_requests table
CREATE TABLE IF NOT EXISTS `booking_requests` (
  `id` VARCHAR(191) NOT NULL,
  `travelerId` VARCHAR(191) NOT NULL,
  `guideId` VARCHAR(191) NOT NULL,
  `bookingDate` DATETIME(3) NOT NULL,
  `bookingTime` VARCHAR(191) NOT NULL,
  `duration` ENUM('HALF_DAY', 'FULL_DAY') NOT NULL,
  `participantCount` INTEGER NOT NULL DEFAULT 1,
  `message` TEXT NULL,
  `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'PAYMENT_PENDING', 'PAID', 'PAYMENT_EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  `estimatedPrice` DECIMAL(10, 2) NULL,
  `guideResponse` TEXT NULL,
  `respondedAt` DATETIME(3) NULL,
  `paymentDeadline` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,

  INDEX `booking_requests_travelerId_idx`(`travelerId`),
  INDEX `booking_requests_guideId_idx`(`guideId`),
  INDEX `booking_requests_status_idx`(`status`),
  INDEX `booking_requests_bookingDate_idx`(`bookingDate`),
  INDEX `booking_requests_expiresAt_idx`(`expiresAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add foreign keys
ALTER TABLE `booking_requests` 
  ADD CONSTRAINT `booking_requests_travelerId_fkey` 
  FOREIGN KEY (`travelerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `booking_requests` 
  ADD CONSTRAINT `booking_requests_guideId_fkey` 
  FOREIGN KEY (`guideId`) REFERENCES `guide_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Add requestId to bookings table
ALTER TABLE `bookings` 
  ADD COLUMN `requestId` VARCHAR(191) NULL,
  ADD UNIQUE INDEX `bookings_requestId_key`(`requestId`);

ALTER TABLE `bookings` 
  ADD CONSTRAINT `bookings_requestId_fkey` 
  FOREIGN KEY (`requestId`) REFERENCES `booking_requests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
