-- Create the database
CREATE DATABASE IF NOT EXISTS german_game;
USE german_game;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user (email, phone)
);

CREATE TABLE IF NOT EXISTS challange_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user (email, phone)
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  current_level INT NOT NULL DEFAULT 1,
  levels_data JSON NOT NULL,
  level_progress JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Gift claims table
CREATE TABLE IF NOT EXISTS gift_claims (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  level_id INT NOT NULL,
  claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_claim (user_id, level_id)
);

-- Updated challenge_participants table (no challenge_id, added challenge_level)
CREATE TABLE IF NOT EXISTS challenge_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  challenge_level INT NOT NULL DEFAULT 1,
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('active', 'completed', 'withdrawn') DEFAULT 'active',
  final_score INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES challange_users(id)
);

-- Challenge progress table (now references user_id directly)
CREATE TABLE IF NOT EXISTS challenge_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  challenge_level INT NOT NULL,
  current_stage INT DEFAULT 1,
  completed_stages JSON,
  score INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES challange_users(id),
  INDEX (user_id, challenge_level)
);

-- Challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  rules TEXT,
  prize_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_user_email_phone ON users(email, phone);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_gift_claims_user_id ON gift_claims(user_id);

