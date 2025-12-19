-- BattleArena Esports Tournament Platform
-- MySQL Schema Reference (for future migration from Firebase)
-- Version: MVP v1.0

-- Users Table
CREATE TABLE users (
    id VARCHAR(128) PRIMARY KEY, -- Firebase UID
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    display_name VARCHAR(100) NOT NULL,
    wallet_balance DECIMAL(10,2) DEFAULT 0.00,
    winning_credits DECIMAL(10,2) DEFAULT 0.00,
    is_banned BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tournaments Table
CREATE TABLE tournaments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    game ENUM('BGMI', 'FREE_FIRE') NOT NULL,
    entry_fee DECIMAL(10,2) NOT NULL,
    max_players INT NOT NULL DEFAULT 100,
    prize_per_player DECIMAL(10,2) DEFAULT 16.00,
    match_date_time DATETIME NOT NULL,
    status ENUM('UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED') DEFAULT 'UPCOMING',
    room_id VARCHAR(50),
    room_password VARCHAR(50),
    room_released BOOLEAN DEFAULT FALSE,
    rules TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(128) NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_game (game),
    INDEX idx_match_date (match_date_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tournament Registrations Table
CREATE TABLE tournament_registrations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tournament_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(128) NOT NULL,
    order_id VARCHAR(100),
    payment_id VARCHAR(100),
    payment_status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    slot_number INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_disqualified BOOLEAN DEFAULT FALSE,
    disqualification_reason TEXT,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_registration (tournament_id, user_id),
    INDEX idx_tournament (tournament_id),
    INDEX idx_user (user_id),
    INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tournament Results Table
CREATE TABLE tournament_results (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tournament_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(128) NOT NULL,
    position INT NOT NULL,
    prize_amount DECIMAL(10,2) NOT NULL,
    kills INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(128) NOT NULL,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE KEY unique_result (tournament_id, user_id),
    INDEX idx_tournament (tournament_id),
    INDEX idx_position (position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Withdrawal Requests Table
CREATE TABLE withdrawal_requests (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(128) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    upi_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    processed_by VARCHAR(128),
    rejection_reason TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (processed_by) REFERENCES users(id),
    INDEX idx_user (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Transactions Table
CREATE TABLE transactions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(128) NOT NULL,
    type ENUM('DEPOSIT', 'WITHDRAWAL', 'PRIZE', 'ENTRY_FEE', 'REFUND') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(255),
    reference_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user (user_id),
    INDEX idx_type (type),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
