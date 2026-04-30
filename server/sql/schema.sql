-- ============================================================
-- MULTI-VENDOR MARKETPLACE - DATABASE SCHEMA
-- ============================================================

CREATE DATABASE IF NOT EXISTS marketplace_db;
USE marketplace_db;

-- ============================================================
-- USERS TABLE (Admin, Vendor, Customer)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid          VARCHAR(36) NOT NULL UNIQUE,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin', 'vendor', 'customer') NOT NULL DEFAULT 'customer',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  is_verified   BOOLEAN NOT NULL DEFAULT FALSE,
  phone         VARCHAR(20),
  avatar_url    VARCHAR(500),
  refresh_token TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role  (role)
);

-- ============================================================
-- VENDOR PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS vendors (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id          INT UNSIGNED NOT NULL UNIQUE,
  shop_name        VARCHAR(150) NOT NULL UNIQUE,
  shop_slug        VARCHAR(150) NOT NULL UNIQUE,
  shop_description TEXT,
  shop_logo_url    VARCHAR(500),
  shop_banner_url  VARCHAR(500),
  business_email   VARCHAR(150),
  business_phone   VARCHAR(20),
  address          TEXT,
  city             VARCHAR(100),
  state            VARCHAR(100),
  country          VARCHAR(100),
  zip_code         VARCHAR(20),
  status           ENUM('pending', 'approved', 'rejected', 'suspended') NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  commission_rate  DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  total_sales      DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_earnings   DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  approved_by      INT UNSIGNED,
  approved_at      TIMESTAMP NULL,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status    (status),
  INDEX idx_shop_slug (shop_slug)
);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  parent_id   INT UNSIGNED DEFAULT NULL,
  image_url   VARCHAR(500),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_slug (slug)
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid             VARCHAR(36) NOT NULL UNIQUE,
  vendor_id        INT UNSIGNED NOT NULL,
  category_id      INT UNSIGNED,
  name             VARCHAR(200) NOT NULL,
  slug             VARCHAR(200) NOT NULL,
  description      TEXT,
  short_description VARCHAR(500),
  price            DECIMAL(10,2) NOT NULL,
  compare_price    DECIMAL(10,2),
  cost_price       DECIMAL(10,2),
  sku              VARCHAR(100),
  stock_quantity   INT NOT NULL DEFAULT 0,
  low_stock_alert  INT NOT NULL DEFAULT 5,
  weight           DECIMAL(8,2),
  status           ENUM('draft', 'active', 'inactive', 'deleted') NOT NULL DEFAULT 'draft',
  is_featured      BOOLEAN NOT NULL DEFAULT FALSE,
  total_sold       INT NOT NULL DEFAULT 0,
  rating_avg       DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  rating_count     INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id)   REFERENCES vendors(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_vendor_id   (vendor_id),
  INDEX idx_category_id (category_id),
  INDEX idx_status      (status),
  INDEX idx_slug        (slug)
);

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS product_images (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  image_url  VARCHAR(500) NOT NULL,
  alt_text   VARCHAR(200),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id)
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid             VARCHAR(36) NOT NULL UNIQUE,
  customer_id      INT UNSIGNED NOT NULL,
  order_number     VARCHAR(50) NOT NULL UNIQUE,
  status           ENUM('pending','confirmed','processing','shipped','delivered','cancelled','refunded') NOT NULL DEFAULT 'pending',
  subtotal         DECIMAL(12,2) NOT NULL,
  shipping_cost    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  tax_amount       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  discount_amount  DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_amount     DECIMAL(12,2) NOT NULL,
  payment_status   ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  payment_method   VARCHAR(50),
  payment_ref      VARCHAR(200),
  shipping_name    VARCHAR(150),
  shipping_email   VARCHAR(150),
  shipping_phone   VARCHAR(20),
  shipping_address TEXT,
  shipping_city    VARCHAR(100),
  shipping_state   VARCHAR(100),
  shipping_country VARCHAR(100),
  shipping_zip     VARCHAR(20),
  notes            TEXT,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_customer_id  (customer_id),
  INDEX idx_order_number (order_number),
  INDEX idx_status       (status)
);

-- ============================================================
-- ORDER ITEMS (per vendor sub-order)
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id         INT UNSIGNED NOT NULL,
  vendor_id        INT UNSIGNED NOT NULL,
  product_id       INT UNSIGNED NOT NULL,
  product_name     VARCHAR(200) NOT NULL,
  product_sku      VARCHAR(100),
  quantity         INT NOT NULL,
  unit_price       DECIMAL(10,2) NOT NULL,
  total_price      DECIMAL(12,2) NOT NULL,
  commission_rate  DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  vendor_earnings  DECIMAL(10,2) NOT NULL,
  item_status      ENUM('pending','confirmed','shipped','delivered','cancelled','refunded') NOT NULL DEFAULT 'pending',
  tracking_number  VARCHAR(100),
  shipped_at       TIMESTAMP NULL,
  delivered_at     TIMESTAMP NULL,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)   REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (vendor_id)  REFERENCES vendors(id) ON DELETE RESTRICT,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_order_id  (order_id),
  INDEX idx_vendor_id (vendor_id)
);

-- ============================================================
-- COMMISSION TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS commissions (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_item_id   INT UNSIGNED NOT NULL,
  vendor_id       INT UNSIGNED NOT NULL,
  order_id        INT UNSIGNED NOT NULL,
  gross_amount    DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  vendor_earnings DECIMAL(10,2) NOT NULL,
  status          ENUM('pending','cleared','paid','refunded') NOT NULL DEFAULT 'pending',
  paid_at         TIMESTAMP NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
  FOREIGN KEY (vendor_id)     REFERENCES vendors(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id)      REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_vendor_id (vendor_id),
  INDEX idx_status    (status)
);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id  INT UNSIGNED NOT NULL,
  customer_id INT UNSIGNED NOT NULL,
  order_id    INT UNSIGNED,
  rating      TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title       VARCHAR(200),
  body        TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id)  REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id)    REFERENCES orders(id) ON DELETE SET NULL,
  UNIQUE KEY uq_customer_product (customer_id, product_id),
  INDEX idx_product_id (product_id)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  type       VARCHAR(80) NOT NULL,
  title      VARCHAR(200) NOT NULL,
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  data       JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read)
);
