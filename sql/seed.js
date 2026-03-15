require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../src/config/database');

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    const adminHash   = await bcrypt.hash('Admin@123', 12);
    const vendorHash  = await bcrypt.hash('Vendor@123', 12);
    const customerHash = await bcrypt.hash('Customer@123', 12);

    // Insert users
    await db.query(`
      INSERT IGNORE INTO users (uuid, name, email, password_hash, role, is_active, is_verified)
      VALUES
        (?, 'Super Admin',    'admin@marketplace.com',    ?, 'admin',    true, true),
        (?, 'Demo Vendor',    'vendor@marketplace.com',   ?, 'vendor',   true, true),
        (?, 'Demo Customer',  'customer@marketplace.com', ?, 'customer', true, true)
    `, [uuidv4(), adminHash, uuidv4(), vendorHash, uuidv4(), customerHash]);

    // Get vendor user id
    const [vendorUser] = await db.query(`SELECT id FROM users WHERE email = 'vendor@marketplace.com'`);

    // Insert vendor profile
    await db.query(`
      INSERT IGNORE INTO vendors (user_id, shop_name, shop_slug, shop_description, status, commission_rate)
      VALUES (?, 'Demo Shop', 'demo-shop', 'A sample vendor shop for testing', 'approved', 10.00)
    `, [vendorUser[0].id]);

    // Insert categories
    await db.query(`
      INSERT IGNORE INTO categories (name, slug, description) VALUES
        ('Electronics',  'electronics',  'Electronic gadgets and devices'),
        ('Clothing',     'clothing',     'Fashion and apparel'),
        ('Home & Garden','home-garden',  'Home improvement products'),
        ('Books',        'books',        'Books and educational material')
    `);

    console.log('✅ Seeding complete!');
    console.log('\n📋 Default credentials:');
    console.log('   Admin    → admin@marketplace.com    / Admin@123');
    console.log('   Vendor   → vendor@marketplace.com   / Vendor@123');
    console.log('   Customer → customer@marketplace.com / Customer@123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
