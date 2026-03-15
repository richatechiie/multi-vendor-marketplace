const db = require('../config/database');
const { success, created, error, notFound, badRequest, paginate } = require('../utils/response');

// ── GET /vendors/profile  (vendor's own) ─────────────────────────────────────
const getMyProfile = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT v.*, u.name, u.email, u.phone FROM vendors v
       JOIN users u ON u.id = v.user_id
       WHERE v.user_id = ?`,
      [req.user.id]
    );
    if (!rows.length) return notFound(res, 'Vendor profile not found');
    return success(res, rows[0]);
  } catch (err) {
    return error(res, err.message);
  }
};

// ── PUT /vendors/profile ──────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const {
      shop_name, shop_description, business_email, business_phone,
      address, city, state, country, zip_code,
    } = req.body;

    const updates = {};
    if (shop_name)        updates.shop_name        = shop_name;
    if (shop_description) updates.shop_description = shop_description;
    if (business_email)   updates.business_email   = business_email;
    if (business_phone)   updates.business_phone   = business_phone;
    if (address)          updates.address           = address;
    if (city)             updates.city              = city;
    if (state)            updates.state             = state;
    if (country)          updates.country           = country;
    if (zip_code)         updates.zip_code          = zip_code;

    if (!Object.keys(updates).length) return badRequest(res, 'No fields to update');

    const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    await db.query(
      `UPDATE vendors SET ${setClauses} WHERE user_id = ?`,
      [...Object.values(updates), req.user.id]
    );

    return success(res, {}, 'Profile updated');
  } catch (err) {
    return error(res, err.message);
  }
};

// ── GET /vendors/dashboard ────────────────────────────────────────────────────
const getDashboard = async (req, res) => {
  try {
    const vendorId = req.vendor.id;

    // Summary stats
    const [stats] = await db.query(`
      SELECT
        COUNT(DISTINCT oi.order_id)              AS total_orders,
        COALESCE(SUM(oi.total_price), 0)         AS total_revenue,
        COALESCE(SUM(oi.vendor_earnings), 0)     AS total_earnings,
        COALESCE(SUM(oi.commission_amount), 0)   AS total_commission,
        COUNT(DISTINCT oi.product_id)            AS products_sold
      FROM order_items oi
      WHERE oi.vendor_id = ? AND oi.item_status NOT IN ('cancelled','refunded')
    `, [vendorId]);

    // Total products
    const [products] = await db.query(
      `SELECT COUNT(*) AS total_products, SUM(status='active') AS active_products
       FROM products WHERE vendor_id = ?`,
      [vendorId]
    );

    // Recent 5 orders
    const [recentOrders] = await db.query(`
      SELECT o.order_number, o.created_at, oi.product_name, oi.quantity,
             oi.total_price, oi.item_status
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE oi.vendor_id = ?
      ORDER BY o.created_at DESC LIMIT 5
    `, [vendorId]);

    // Monthly sales (last 6 months)
    const [monthlySales] = await db.query(`
      SELECT DATE_FORMAT(o.created_at, '%Y-%m') AS month,
             COALESCE(SUM(oi.vendor_earnings), 0) AS earnings,
             COUNT(DISTINCT oi.order_id) AS orders
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE oi.vendor_id = ?
        AND o.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        AND oi.item_status NOT IN ('cancelled','refunded')
      GROUP BY month ORDER BY month
    `, [vendorId]);

    return success(res, {
      summary   : { ...stats[0], ...products[0] },
      recentOrders,
      monthlySales,
    });
  } catch (err) {
    return error(res, err.message);
  }
};

// ── GET /vendors/orders ───────────────────────────────────────────────────────
const getOrders = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let where = 'oi.vendor_id = ?';
    const params = [vendorId];
    if (status) { where += ' AND oi.item_status = ?'; params.push(status); }

    const [rows] = await db.query(`
      SELECT o.order_number, o.created_at, o.payment_status,
             oi.id AS item_id, oi.product_name, oi.quantity, oi.unit_price,
             oi.total_price, oi.vendor_earnings, oi.item_status, oi.tracking_number,
             u.name AS customer_name, u.email AS customer_email
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN users  u ON u.id = o.customer_id
      WHERE ${where}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM order_items oi WHERE ${where}`,
      params
    );

    return paginate(res, rows, total, page, limit);
  } catch (err) {
    return error(res, err.message);
  }
};

// ── PUT /vendors/orders/:itemId/status ────────────────────────────────────────
const updateOrderItemStatus = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { status, tracking_number } = req.body;

    const allowed = ['confirmed', 'shipped', 'delivered'];
    if (!allowed.includes(status)) return badRequest(res, `Status must be one of: ${allowed.join(', ')}`);

    const [rows] = await db.query(
      'SELECT id FROM order_items WHERE id = ? AND vendor_id = ?',
      [itemId, req.vendor.id]
    );
    if (!rows.length) return notFound(res, 'Order item not found');

    const updates = { item_status: status };
    if (status === 'shipped')   { updates.shipped_at   = new Date(); if (tracking_number) updates.tracking_number = tracking_number; }
    if (status === 'delivered') { updates.delivered_at = new Date(); }

    const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    await db.query(`UPDATE order_items SET ${setClauses} WHERE id = ?`, [...Object.values(updates), itemId]);

    return success(res, {}, 'Order item status updated');
  } catch (err) {
    return error(res, err.message);
  }
};

// ── GET /vendors/analytics ────────────────────────────────────────────────────
const getAnalytics = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const { period = '30' } = req.query; // days

    // Top products
    const [topProducts] = await db.query(`
      SELECT p.name, SUM(oi.quantity) AS units_sold,
             SUM(oi.vendor_earnings) AS earnings
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.vendor_id = ?
        AND oi.item_status NOT IN ('cancelled','refunded')
        AND oi.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY p.id ORDER BY units_sold DESC LIMIT 5
    `, [vendorId, parseInt(period)]);

    // Daily earnings
    const [dailyEarnings] = await db.query(`
      SELECT DATE(o.created_at) AS date,
             SUM(oi.vendor_earnings) AS earnings,
             COUNT(DISTINCT oi.order_id) AS orders
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE oi.vendor_id = ?
        AND oi.item_status NOT IN ('cancelled','refunded')
        AND o.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY date ORDER BY date
    `, [vendorId, parseInt(period)]);

    // Commission summary
    const [commission] = await db.query(`
      SELECT COALESCE(SUM(commission_amount),0) AS total_commission,
             COALESCE(SUM(vendor_earnings),0)   AS total_earnings,
             SUM(status='pending') AS pending_clearance,
             SUM(status='paid')    AS paid
      FROM commissions WHERE vendor_id = ?
    `, [vendorId]);

    return success(res, { topProducts, dailyEarnings, commission: commission[0] });
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { getMyProfile, updateProfile, getDashboard, getOrders, updateOrderItemStatus, getAnalytics };
