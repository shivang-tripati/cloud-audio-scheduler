DROP TABLE IF EXISTS device_heartbeats;
DROP TABLE IF EXISTS playback_logs;
DROP TABLE IF EXISTS schedule_targets;
DROP TABLE IF EXISTS schedules;
DROP TABLE IF EXISTS audio_files;
DROP TABLE IF EXISTS devices;
DROP TABLE IF EXISTS branches;
DROP TABLE IF EXISTS users;

-- USERS TABLE
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('SUPER_ADMIN', 'STORE_MANAGER') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BRANCHES TABLE
CREATE TABLE branches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    branch_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_branch_code (branch_code),
    INDEX idx_region (region),
    INDEX idx_active (is_active),
    INDEX idx_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DEVICES TABLE
CREATE TABLE devices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    branch_id INT NOT NULL,
    device_code VARCHAR(50) UNIQUE NOT NULL,
    device_name VARCHAR(255) NULL,
    last_seen TIMESTAMP NULL,
    status ENUM('ONLINE', 'OFFLINE') DEFAULT 'OFFLINE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    INDEX idx_device_code (device_code),
    INDEX idx_branch (branch_id),
    INDEX idx_status (status),
    INDEX idx_last_seen (last_seen),
    INDEX idx_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AUDIO_FILES TABLE (WITH file_path)
CREATE TABLE audio_files (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    audio_type ENUM('PRAYER', 'FESTIVAL', 'DAILY') NOT NULL,
    language VARCHAR(50) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_path VARCHAR(500) NULL COMMENT 'Local file path for deletion',
    duration_seconds INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_audio_type (audio_type),
    INDEX idx_language (language),
    INDEX idx_active (is_active),
    INDEX idx_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SCHEDULES TABLE
CREATE TABLE schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    audio_id INT NOT NULL,
    schedule_type ENUM('DAILY_PRAYER', 'FESTIVAL', 'DAILY') NOT NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    play_time TIME NOT NULL,
    repeat_interval_minutes INT NULL,
    priority INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (audio_id) REFERENCES audio_files(id) ON DELETE CASCADE,
    INDEX idx_schedule_type (schedule_type),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_play_time (play_time),
    INDEX idx_priority (priority),
    INDEX idx_active (is_active),
    INDEX idx_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SCHEDULE_TARGETS TABLE
CREATE TABLE schedule_targets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    schedule_id INT NOT NULL,
    target_type ENUM('ALL', 'REGION', 'BRANCH') NOT NULL,
    target_value VARCHAR(255) NULL,
    FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
    INDEX idx_schedule (schedule_id),
    INDEX idx_target_type (target_type),
    INDEX idx_target_value (target_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PLAYBACK_LOGS TABLE
CREATE TABLE playback_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    device_id INT NOT NULL,
    audio_id INT NOT NULL,
    played_at TIMESTAMP NOT NULL,
    status ENUM('PLAYED', 'MISSED') NOT NULL,
    reason VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    FOREIGN KEY (audio_id) REFERENCES audio_files(id) ON DELETE CASCADE,
    INDEX idx_device (device_id),
    INDEX idx_audio (audio_id),
    INDEX idx_played_at (played_at),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DEVICE_HEARTBEATS TABLE
CREATE TABLE device_heartbeats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    device_id INT NOT NULL,
    heartbeat_time TIMESTAMP NOT NULL,
    online BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    INDEX idx_device (device_id),
    INDEX idx_heartbeat_time (heartbeat_time),
    INDEX idx_online (online)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;