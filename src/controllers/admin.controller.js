const db = require('../config/database');
const { success, error, notFound, badRequest, paginate } = require('../utils/response');

// ── GET /admin/vendors ────────────────────────────────────────────────────────
const listVendors = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let where = '1=1';
    const params = [];
    if (status) { where += ' AND v.status = ?'; params.push(status); }

    const [rows] = await db.query(`
      SELECT v.id, v.shop_name, v.shop_slug, v.status, v.commission_rate,
             v.total_sales, v.total_earnings, v.created_at,
             u.name, u.email, u.phone, u.is_active,
             (SELECT COUNT(*) FROM products p WHERE p.vendor_id = v.id AND p.status = 'active') AS active_products
      FROM vendors v
      JOIN users u ON u.id = v.user_id
      WHERE ${where}
      ORDER BY v.created_at DESC LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM vendors v WHERE ${where}`, params
    );

    return paginate(res, rows, total, page, limit);
  } catch (err) {
    return error(res, err.message);
  }
};

// ── PUT /admin/vendors/:id/approve ────────────────────────────────────────────
const approveVendor = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, status FROM vendors WHERE id = ?', [req.params.id]);
    if (!rows.length) return notFound(res, 'Vendor not found');
    if (rows[0].status === 'approved') return badRequest(res, 'Vendor already approved');

    await db.query(
      "UPDATE vendors SET status = 'approved', approved_by = ?, approved_at = NOW() WHERE id = ?",
      [req.user.id, req.params.id]
    );

    // Activate user
    await db.query(
      `UPDATE users SET is_verified = true WHERE id =
       (SELECT user_id FROM vendors WHERE id = ?)`,
      [req.params.id]
    );

    return success(res, {}, 'Vendor approved successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

// ── PUT /admin/vendors/:id/reject ─────────────────────────────────────────────
const rejectVendor = async (req, res) => {
  try {
    const { reason } = req.body;
    const [rows] = await db.query('SELECT id FROM vendors WHERE id = ?', [req.params.id]);
    if (!rows.length) return notFound(res, 'Vendor not found');

    await db.query(
      "UPDATE vendors SET status = 'rejected', rejection_reason = ? WHERE id = ?",
      [reason || 'No reason provided', req.params.id]
    );

    return success(res, {}, 'Vendor rejected');
  } catch (err) {
    return error(res, err.message);
  }
};

// ── PUT /admin/vendors/:id/suspend ────────────────────────────────────────────
const suspendVendor = async (req, res) => {
  try {
    await db.query("UPDATE vendors SET status = 'suspended' WHERE id = ?", [req.params.id]);
    return success(res, {}, 'Vendor suspended');
  } catch (err) {
    return error(res, err.message);
  }
};

// ── PUT /admin/vendors/:id/commission ─────────────────────────────────────────
const updateCommission = async (req, res) => {
  try {
    const { commission_rate } = req.body;
    if (commission_rate < 0 || commission_rate > 100)
      return badRequest(res, 'Commission rate must be between 0 and 100');

    await db.query('UPDATE vendors SET commission_rate = ? WHERE id = ?', [commission_rate, req.params.id]);
    return success(res, {}, 'Commission rate updated');
  } catch (err) {
    return error(res, err.message);
  }
};

// ── GET /admin/orders ─────────────────────────────────────────────────────────
const listOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, from, to } = req.query;
    const offset = (page - 1) * limit;

    let where = '1=1';
    const params = [];
    if (status) { where += ' AND o.status = ?'; params.push(status); }
    if (from)   { where += ' AND o.created_at >= ?'; params.push(from); }
    if (to)     { where += ' AND o.created_at <= ?'; params.push(to); }

    const [rows] = await db.query(`
      SELECT o.uuid, o.order_number, o.status, o.total_amount, o.payment_status,
             o.created_at, u.name AS customer_name, u.email AS customer_email,
             COUNT(oi.id) AS item_count
      FROM orders o
      JOIN users u ON u.id = o.customer_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE ${where}
      GROUP BY o.id ORDER BY o.created_at DESC LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM orders o WHERE ${where}`, params
    );

    return paginate(res, rows, total, page, limit);
  } catch (err) {
    return error(res, err.message);
  }
};

// ── PUT /admin/orders/:uuid/status ────────────────────────────────────────────
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['confirmed','processing','shipped','delivered','cancelled','refunded'];
    if (!allowed.includes(status)) return badRequest(res, 'Invalid status');

    const [rows] = await db.query('SELECT id FROM orders WHERE uuid = ?', [req.params.uuid]);
    if (!rows.length) return notFound(res, 'Order not found');

    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, rows[0].id]);
    return success(res, {}, 'Order status updated');
  } catch (err) {
    return error(res, err.message);
  }
};

// ── GET /admin/commissions ────────────────────────────────────────────────────
const listCommissions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, vendor_id } = req.query;
    const offset = (page - 1) * limit;

    let where = '1=1';
    const params = [];
    if (status)    { where += ' AND c.status = ?';    params.push(status); }
    if (vendor_id) { where += ' AND c.vendor_id = ?'; params.push(vendor_id); }

    const [rows] = await db.query(`
      SELECT c.id, c.gross_amount, c.commission_rate, c.commission_amount,
             c.vendor_earnings, c.status, c.created_at,
             v.shop_name, o.order_number
      FROM commissions c
      JOIN vendors v ON v.id = c.vendor_id
      JOIN orders  o ON o.id = c.order_id
      WHERE ${where}
      ORDER BY c.created_at DESC LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM commissions c WHERE ${where}`, params
    );

    return paginate(res, rows, total, page, limit);
  } catch (err) {
    return error(res, err.message);
  }
};

// ── PUT /admin/commissions/:id/pay ────────────────────────────────────────────
const markCommissionPaid = async (req, res) => {
  try {
    await db.query(
      "UPDATE commissions SET status = 'paid', paid_at = NOW() WHERE id = ?",
      [req.params.id]
    );
    return success(res, {}, 'Commission marked as paid');
  } catch (err) {
    return error(res, err.message);
  }
};

// ── GET /admin/analytics ──────────────────────────────────────────────────────
const getPlatformAnalytics = async (req, res) => {
  try {
    const [overview] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'customer') AS total_customers,
        (SELECT COUNT(*) FROM vendors WHERE status = 'approved') AS total_vendors,
        (SELECT COUNT(*) FROM vendors WHERE status = 'pending') AS pending_vendors,
        (SELECT COUNT(*) FROM products WHERE status = 'active') AS total_products,
        (SELECT COUNT(*) FROM orders) AS total_orders,
        (SELECT COALESCE(SUM(total_amount),0) FROM orders WHERE status = 'delivered') AS total_revenue,
        (SELECT COALESCE(SUM(commission_amount),0) FROM commissions) AS total_commission
    `);

    const [revenueByMonth] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
             COUNT(*) AS orders,
             SUM(total_amount) AS revenue
      FROM orders WHERE status != 'cancelled'
      GROUP BY month ORDER BY month DESC LIMIT 12
    `);

    const [topVendors] = await db.query(`
      SELECT v.shop_name, v.total_sales, v.total_earnings,
             COUNT(DISTINCT p.id) AS products
      FROM vendors v
      LEFT JOIN products p ON p.vendor_id = v.id AND p.status = 'active'
      WHERE v.status = 'approved'
      GROUP BY v.id ORDER BY v.total_sales DESC LIMIT 10
    `);

    return success(res, { overview: overview[0], revenueByMonth, topVendors });
  } catch (err) {
    return error(res, err.message);
  }
};

// ── GET /admin/users ──────────────────────────────────────────────────────────
const listUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role } = req.query;
    const offset = (page - 1) * limit;

    let where = '1=1';
    const params = [];
    if (role) { where += ' AND role = ?'; params.push(role); }

    const [rows] = await db.query(`
      SELECT id, uuid, name, email, role, is_active, is_verified, created_at
      FROM users WHERE ${where}
      ORDER BY created_at DESC LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM users WHERE ${where}`, params
    );

    return paginate(res, rows, total, page, limit);
  } catch (err) {
    return error(res, err.message);
  }
};

// ── PUT /admin/users/:id/toggle ───────────────────────────────────────────────
const toggleUserStatus = async (req, res) => {
  try {
    await db.query('UPDATE users SET is_active = NOT is_active WHERE id = ?', [req.params.id]);
    return success(res, {}, 'User status toggled');
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = {
  listVendors, approveVendor, rejectVendor, suspendVendor, updateCommission,
  listOrders, updateOrderStatus, listCommissions, markCommissionPaid,
  getPlatformAnalytics, listUsers, toggleUserStatus,
};
