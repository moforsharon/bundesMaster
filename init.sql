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

-- Create indexes for better performance
CREATE INDEX idx_user_email_phone ON users(email, phone);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_gift_claims_user_id ON gift_claims(user_id);

