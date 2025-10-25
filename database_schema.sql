-- Q Solutions Database Schema
-- PostgreSQL Database Setup

-- Create database (run this separately)
-- CREATE DATABASE qsolutions_db;

-- Connect to the database and run the following:

-- Quotes table for storing customer quote requests
CREATE TABLE quotes (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    city VARCHAR(100) NOT NULL,
    device_type VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    issue_description TEXT NOT NULL,
    tracking_code VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Repair status updates table for tracking repair progress
CREATE TABLE repair_status_updates (
    id SERIAL PRIMARY KEY,
    quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    status_message VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_quotes_tracking_code ON quotes(tracking_code);
CREATE INDEX idx_quotes_created_at ON quotes(created_at);
CREATE INDEX idx_repair_status_quote_id ON repair_status_updates(quote_id);
CREATE INDEX idx_repair_status_created_at ON repair_status_updates(created_at);

-- Insert initial data or sample data (optional)
-- This can be removed in production

