-- ==============================================================================
-- ELITE GYM MANAGEMENT SYSTEM - DATABASE SCHEMA (MySQL 8.0)
-- Normalized 3NF Schema with Foreign Keys, Indexes, Constraints & Cascades
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `elite_gym`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE `elite_gym`;

-- ------------------------------------------------------------------------------
-- 1. Table: users (Core Authentication & Identification)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(100) NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `avatar_url` VARCHAR(255) NULL,
    `role` ENUM('ROLE_STUDENT', 'ROLE_TRAINER', 'ROLE_ADMIN') NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_users_email` (`email`),
    UNIQUE KEY `uk_users_username` (`username`),
    INDEX `idx_users_role` (`role`),
    INDEX `idx_users_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. Table: trainer_profiles (Trainer Domain Data)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `trainer_profiles` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `specialization` VARCHAR(100) NOT NULL,
    `experience_years` INT NOT NULL DEFAULT 1,
    `bio` TEXT NULL,
    `certification` VARCHAR(150) NULL,
    `max_student_capacity` INT NOT NULL DEFAULT 20,
    `is_available` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_trainer_profiles_user_id` (`user_id`),
    INDEX `idx_trainer_profiles_is_available` (`is_available`),
    CONSTRAINT `fk_trainer_profiles_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. Table: student_profiles (Student / Member Domain Data)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `student_profiles` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `emergency_contact` VARCHAR(20) NULL,
    `blood_group` VARCHAR(10) NULL,
    `medical_notes` TEXT NULL,
    `height_cm` DECIMAL(5,2) NULL,
    `weight_kg` DECIMAL(5,2) NULL,
    `fitness_goal` VARCHAR(100) NULL,
    `assigned_trainer_id` BIGINT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_student_profiles_user_id` (`user_id`),
    INDEX `idx_student_profiles_assigned_trainer` (`assigned_trainer_id`),
    CONSTRAINT `fk_student_profiles_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_student_profiles_trainer`
        FOREIGN KEY (`assigned_trainer_id`) REFERENCES `trainer_profiles` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. Table: membership_plans (Catalog of Available Plans)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `membership_plans` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL,
    `duration_months` INT NOT NULL,
    `price` DECIMAL(10,2) NOT NULL,
    `features` JSON NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_membership_plans_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. Table: student_memberships (Purchased Subscription Periods)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `student_memberships` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `student_id` BIGINT NOT NULL,
    `plan_id` BIGINT NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `status` ENUM('ACTIVE', 'EXPIRED', 'PENDING', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_student_memberships_student_status` (`student_id`, `status`),
    INDEX `idx_student_memberships_end_date` (`end_date`),
    CONSTRAINT `fk_student_memberships_student`
        FOREIGN KEY (`student_id`) REFERENCES `student_profiles` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_student_memberships_plan`
        FOREIGN KEY (`plan_id`) REFERENCES `membership_plans` (`id`)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. Table: payments (Financial Transactions Ledger)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `payments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `student_id` BIGINT NOT NULL,
    `membership_id` BIGINT NOT NULL,
    `amount` DECIMAL(10,2) NOT NULL,
    `payment_method` ENUM('CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'CASH') NOT NULL,
    `transaction_id` VARCHAR(100) NOT NULL,
    `payment_status` ENUM('SUCCESS', 'PENDING', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'SUCCESS',
    `invoice_number` VARCHAR(50) NOT NULL,
    `paid_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `notes` VARCHAR(255) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_payments_transaction_id` (`transaction_id`),
    UNIQUE KEY `uk_payments_invoice_number` (`invoice_number`),
    INDEX `idx_payments_student` (`student_id`),
    INDEX `idx_payments_membership` (`membership_id`),
    INDEX `idx_payments_status` (`payment_status`),
    CONSTRAINT `fk_payments_student`
        FOREIGN KEY (`student_id`) REFERENCES `student_profiles` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_payments_membership`
        FOREIGN KEY (`membership_id`) REFERENCES `student_memberships` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. Table: attendances (Student Gym Check-Ins)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `attendances` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `student_id` BIGINT NOT NULL,
    `date` DATE NOT NULL,
    `check_in_time` TIME NOT NULL,
    `check_out_time` TIME NULL,
    `status` ENUM('PRESENT', 'ABSENT', 'LATE') NOT NULL DEFAULT 'PRESENT',
    `marked_by_admin_id` BIGINT NULL,
    `notes` VARCHAR(255) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_attendances_student_date` (`student_id`, `date`),
    INDEX `idx_attendances_date` (`date`),
    CONSTRAINT `fk_attendances_student`
        FOREIGN KEY (`student_id`) REFERENCES `student_profiles` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_attendances_admin`
        FOREIGN KEY (`marked_by_admin_id`) REFERENCES `users` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. Table: workout_plans (Weekly Routines & Templates)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `workout_plans` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `trainer_id` BIGINT NOT NULL,
    `student_id` BIGINT NULL,
    `difficulty` ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') NOT NULL DEFAULT 'INTERMEDIATE',
    `target_goal` VARCHAR(100) NULL,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_workout_plans_trainer` (`trainer_id`),
    INDEX `idx_workout_plans_student` (`student_id`),
    CONSTRAINT `fk_workout_plans_trainer`
        FOREIGN KEY (`trainer_id`) REFERENCES `trainer_profiles` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_workout_plans_student`
        FOREIGN KEY (`student_id`) REFERENCES `student_profiles` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 9. Table: workout_exercises (Exercises Inside a Plan)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `workout_exercises` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `workout_plan_id` BIGINT NOT NULL,
    `day_of_week` ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL,
    `exercise_name` VARCHAR(100) NOT NULL,
    `sets` INT NOT NULL,
    `reps` VARCHAR(50) NOT NULL,
    `target_weight_kg` DECIMAL(5,2) NULL,
    `rest_seconds` INT NOT NULL DEFAULT 60,
    `notes` VARCHAR(255) NULL,
    `order_index` INT NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    INDEX `idx_workout_exercises_plan_day` (`workout_plan_id`, `day_of_week`),
    CONSTRAINT `fk_workout_exercises_plan`
        FOREIGN KEY (`workout_plan_id`) REFERENCES `workout_plans` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 10. Table: complaints (Member Grievances & Support Tickets)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `complaints` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `student_id` BIGINT NOT NULL,
    `subject` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `category` ENUM('EQUIPMENT', 'FACILITY', 'TRAINER', 'BILLING', 'OTHER') NOT NULL,
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    `status` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `admin_response` TEXT NULL,
    `resolved_by_admin_id` BIGINT NULL,
    `resolved_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_complaints_student` (`student_id`),
    INDEX `idx_complaints_status` (`status`),
    INDEX `idx_complaints_category` (`category`),
    CONSTRAINT `fk_complaints_student`
        FOREIGN KEY (`student_id`) REFERENCES `student_profiles` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_complaints_admin`
        FOREIGN KEY (`resolved_by_admin_id`) REFERENCES `users` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 11. Table: notifications (User In-App Notifications)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('MEMBERSHIP', 'PAYMENT', 'WORKOUT', 'ATTENDANCE', 'COMPLAINT', 'SYSTEM') NOT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
    `action_link` VARCHAR(255) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_notifications_user_read` (`user_id`, `is_read`),
    CONSTRAINT `fk_notifications_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 12. Table: trainer_requests (Student-Trainer Consultations & Booking Requests)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `trainer_requests` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `student_id` BIGINT NOT NULL,
    `trainer_id` BIGINT NOT NULL,
    `request_type` ENUM('TRAINER_ASSIGNMENT', 'WORKOUT_CHANGE', 'SLOT_BOOKING') NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `request_notes` TEXT NULL,
    `response_notes` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_trainer_requests_trainer_status` (`trainer_id`, `status`),
    INDEX `idx_trainer_requests_student` (`student_id`),
    CONSTRAINT `fk_trainer_requests_student`
        FOREIGN KEY (`student_id`) REFERENCES `student_profiles` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_trainer_requests_trainer`
        FOREIGN KEY (`trainer_id`) REFERENCES `trainer_profiles` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 13. Table: progress_entries (Student Body Measurements & Progress Logs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `progress_entries` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `student_id` BIGINT NOT NULL,
    `record_date` DATE NOT NULL,
    `weight_kg` DECIMAL(5,2) NULL,
    `height_cm` DECIMAL(5,2) NULL,
    `body_fat_pct` DECIMAL(5,2) NULL,
    `muscle_mass_kg` DECIMAL(5,2) NULL,
    `chest_cm` DECIMAL(5,2) NULL,
    `waist_cm` DECIMAL(5,2) NULL,
    `hips_cm` DECIMAL(5,2) NULL,
    `arm_cm` DECIMAL(5,2) NULL,
    `thigh_cm` DECIMAL(5,2) NULL,
    `notes` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_progress_entries_student_date` (`student_id`, `record_date`),
    INDEX `idx_progress_entries_student_date` (`student_id`, `record_date`),
    CONSTRAINT `fk_progress_entries_student`
        FOREIGN KEY (`student_id`) REFERENCES `student_profiles` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 14. Table: progress_photos (Progress Photo Attachments)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `progress_photos` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `progress_entry_id` BIGINT NOT NULL,
    `photo_url` VARCHAR(500) NOT NULL,
    `caption` VARCHAR(200) NULL,
    `photo_type` ENUM('BEFORE', 'AFTER', 'PROGRESS') NOT NULL DEFAULT 'PROGRESS',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_progress_photos_entry` (`progress_entry_id`),
    CONSTRAINT `fk_progress_photos_entry`
        FOREIGN KEY (`progress_entry_id`) REFERENCES `progress_entries` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
