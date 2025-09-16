-- E-commerce Database Schema for XAMPP/MySQL
-- Run this script in phpMyAdmin or MySQL command line

-- Create database (uncomment if needed)
-- CREATE DATABASE ecommerce_db;
-- USE ecommerce_db;

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    images JSON,
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    in_stock BOOLEAN DEFAULT TRUE,
    stock_quantity INT DEFAULT 0,
    tags JSON,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_featured (featured),
    INDEX idx_in_stock (in_stock),
    INDEX idx_created_at (created_at)
);

-- Insert sample categories
INSERT IGNORE INTO product_categories (id, name, description, image) VALUES
('electronics', 'Electronics', 'Latest technology and electronic devices', '/placeholder.svg?height=200&width=300'),
('clothing', 'Clothing', 'Fashion and apparel for all occasions', '/placeholder.svg?height=200&width=300'),
('furniture', 'Furniture', 'Home and office furniture', '/placeholder.svg?height=200&width=300'),
('lifestyle', 'Lifestyle', 'Products for everyday living', '/placeholder.svg?height=200&width=300'),
('food', 'Food & Beverages', 'Gourmet food and specialty beverages', '/placeholder.svg?height=200&width=300'),
('phone', 'Phone', 'Smartphones and mobile devices', '/placeholder.svg?height=200&width=300'),
('phone-accessories', 'Phone Accessories', 'Cases, chargers, and phone accessories', '/placeholder.svg?height=200&width=300'),
('table', 'Table', 'Tables and desk furniture', '/placeholder.svg?height=200&width=300'),
('laptop', 'Laptop', 'Laptops and portable computers', '/placeholder.svg?height=200&width=300');

