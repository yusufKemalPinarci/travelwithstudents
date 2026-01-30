-- Add tourSnapshot field to bookings table
ALTER TABLE bookings ADD COLUMN tourSnapshot JSON NULL AFTER notes;
