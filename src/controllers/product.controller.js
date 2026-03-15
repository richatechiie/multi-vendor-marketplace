const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { success, created, error, notFound, badRequest, paginate } = require('../utils/response');

// ── GET /products (public) ────────────────────────────────────────────────────
const listProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, vendor, search, sort = 'created_at', order = 'DESC' } = req.query;
    const offset = (page - 1) * limit;

    let where = "p.status = 'active'";
    const params = [];

    if (category) { where += ' AND c.slug = ?'; params.push(category); }
    if (vendor)   { where += ' AND v.shop_slug = ?'; params.push(vendor); }
    if (search)   { where += ' AND (p.name LIKE ? OR p.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    const allowedSort  = ['price', 'created_at', 'rating_avg', 'total_sold'];
    const allowedOrder = ['ASC', 'DESC'];
    const sortCol  = allowedSort.includes(sort)    ? sort    : 'created_at';
    const sortDir  = allowedOrder.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

    const [rows] = await db.query(`
      SELECT p.uuid, p.name, p.slug, p.price, p.compare_price, p.stock_quantity,
             p.rating_avg, p.rating_count, p.total_sold, p.created_at,
             v.shop_name, v.shop_slug,
             c.name AS category_name,
             pi.image_url AS primary_image
      FROM products p
      JOIN vendors v ON v.id = p.vendor_id
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
      WHERE ${where}
      ORDER BY p.${sortCol} ${sortDir}
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM products p
       JOIN vendors v ON v.id = p.vendor_id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE ${where}`,
      params
    );

    return paginate(res, rows, total, page, limit);
  } catch (err) {
    return error(res, err.message);
  }
};

// ── GET /products/:slug (public) ──────────────────────────────────────────────
const getProduct = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, v.shop_name, v.shop_slug, v.shop_logo_url,
             c.name AS category_name, c.slug AS category_slug
      FROM products p
      JOIN vendors v ON v.id = p.vendor_id
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.slug = ? AND p.status = 'active'
    `, [req.params.slug]);

    if (!rows.length) return notFound(res, 'Product not found');

    const product = rows[0];

    const [images] = await db.query(
      'SELECT image_url, alt_text, is_primary FROM product_images WHERE product_id = ? ORDER BY sort_order',
      [product.id]
    );

    const [reviews] = await db.query(`
      SELECT r.rating, r.title, r.body, r.created_at, u.name AS customer_name
      FROM reviews r JOIN users u ON u.id = r.customer_id
      WHERE r.product_id = ? AND r.is_approved = true
      ORDER BY r.created_at DESC LIMIT 10
    `, [product.id]);

    return success(res, { ...product, images, reviews });
  } catch (err) {
    return error(res, err.message);
  }
};

// ── POST /vendor/products ─────────────────────────────────────────────────────
const createProduct = async (req, res) => {
  try {
    const {
      name, description, short_description, price, compare_price,
      cost_price, sku, stock_quantity, low_stock_alert, weight,
      category_id, images = [],
    } = req.body;

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
    const uuid = uuidv4();

    const [result] = await db.query(`
      INSERT INTO products
        (uuid, vendor_id, category_id, name, slug, description, short_description,
         price, compare_price, cost_price, sku, stock_quantity, low_stock_alert, weight, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
    `, [uuid, req.vendor.id, category_id || null, name, slug, description, short_description,
        price, compare_price || null, cost_price || null, sku || null,
        stock_quantity || 0, low_stock_alert || 5, weight || null]);

    const productId = result.insertId;

    // Insert images
    if (images.length) {
      const imgValues = images.map((img, i) => [productId, img.url, img.alt || '', i === 0]);
      await db.query(
        'INSERT INTO product_images (product_id, image_url, alt_text, is_primary) VALUES ?',
        [imgValues]
      );
    }

    return created(res, { uuid, slug }, 'Product created');
  } catch (err) {
    return error(res, err.message);
  }
};

// ── PUT /vendor/products/:uuid ────────────────────────────────────────────────
const updateProduct = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id FROM products WHERE uuid = ? AND vendor_id = ?',
      [req.params.uuid, req.vendor.id]
    );
    if (!rows.length) return notFound(res, 'Product not found');

    const allowed = ['name','description','short_description','price','compare_price',
                     'cost_price','sku','stock_quantity','low_stock_alert','weight','category_id','status'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    if (!Object.keys(updates).length) return badRequest(res, 'No fields to update');

    const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    await db.query(
      `UPDATE products SET ${setClauses} WHERE id = ?`,
      [...Object.values(updates), rows[0].id]
    );

    return success(res, {}, 'Product updated');
  } catch (err) {
    return error(res, err.message);
  }
};

// ── DELETE /vendor/products/:uuid ─────────────────────────────────────────────
const deleteProduct = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id FROM products WHERE uuid = ? AND vendor_id = ?',
      [req.params.uuid, req.vendor.id]
    );
    if (!rows.length) return notFound(res, 'Product not found');

    await db.query("UPDATE products SET status = 'deleted' WHERE id = ?", [rows[0].id]);
    return success(res, {}, 'Product deleted');
  } catch (err) {
    return error(res, err.message);
  }
};

// ── GET /vendor/products ──────────────────────────────────────────────────────
const getMyProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let where = "p.vendor_id = ? AND p.status != 'deleted'";
    const params = [req.vendor.id];
    if (status) { where += ' AND p.status = ?'; params.push(status); }

    const [rows] = await db.query(`
      SELECT p.uuid, p.name, p.slug, p.price, p.stock_quantity, p.status,
             p.total_sold, p.rating_avg, p.created_at,
             c.name AS category_name,
             pi.image_url AS primary_image
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
      WHERE ${where}
      ORDER BY p.created_at DESC LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM products p WHERE ${where}`, params
    );

    return paginate(res, rows, total, page, limit);
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct, getMyProducts };
