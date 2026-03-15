const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { success, created, error, notFound, badRequest, paginate } = require('../utils/response');

// ── POST /orders  (customer places order) ────────────────────────────────────
const placeOrder = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { items, shipping, payment_method = 'cod', notes } = req.body;
    // items: [{ product_uuid, quantity }]

    if (!items?.length) return badRequest(res, 'Order must have at least one item');

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const [rows] = await conn.query(`
        SELECT p.id, p.name, p.sku, p.price, p.stock_quantity, p.vendor_id,
               v.commission_rate
        FROM products p
        JOIN vendors v ON v.id = p.vendor_id
        WHERE p.uuid = ? AND p.status = 'active' AND v.status = 'approved'
      `, [item.product_uuid]);

      if (!rows.length) {
        await conn.rollback();
        return badRequest(res, `Product not found or unavailable: ${item.product_uuid}`);
      }

      const product = rows[0];
      if (product.stock_quantity < item.quantity) {
        await conn.rollback();
        return badRequest(res, `Insufficient stock for: ${product.name}`);
      }

      const totalPrice      = parseFloat((product.price * item.quantity).toFixed(2));
      const commissionAmt   = parseFloat((totalPrice * product.commission_rate / 100).toFixed(2));
      const vendorEarnings  = parseFloat((totalPrice - commissionAmt).toFixed(2));

      subtotal += totalPrice;
      orderItems.push({
        product_id      : product.id,
        vendor_id       : product.vendor_id,
        product_name    : product.name,
        product_sku     : product.sku,
        quantity        : item.quantity,
        unit_price      : product.price,
        total_price     : totalPrice,
        commission_rate : product.commission_rate,
        commission_amount: commissionAmt,
        vendor_earnings : vendorEarnings,
      });
    }

    const taxAmount     = parseFloat((subtotal * 0.05).toFixed(2)); // 5% tax
    const shippingCost  = subtotal >= 500 ? 0 : 50;                 // free shipping over ₹500
    const totalAmount   = parseFloat((subtotal + taxAmount + shippingCost).toFixed(2));
    const orderNumber   = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    const uuid          = uuidv4();

    // Create order
    const [orderResult] = await conn.query(`
      INSERT INTO orders
        (uuid, customer_id, order_number, status, subtotal, tax_amount, shipping_cost,
         total_amount, payment_method, shipping_name, shipping_email, shipping_phone,
         shipping_address, shipping_city, shipping_state, shipping_country, shipping_zip, notes)
      VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [uuid, req.user.id, orderNumber, subtotal, taxAmount, shippingCost, totalAmount,
        payment_method, shipping.name, shipping.email, shipping.phone,
        shipping.address, shipping.city, shipping.state, shipping.country, shipping.zip, notes || null]);

    const orderId = orderResult.insertId;

    // Insert order items, update stock, create commissions
    for (const oi of orderItems) {
      const [itemResult] = await conn.query(`
        INSERT INTO order_items
          (order_id, vendor_id, product_id, product_name, product_sku, quantity,
           unit_price, total_price, commission_rate, commission_amount, vendor_earnings)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [orderId, oi.vendor_id, oi.product_id, oi.product_name, oi.product_sku,
          oi.quantity, oi.unit_price, oi.total_price, oi.commission_rate,
          oi.commission_amount, oi.vendor_earnings]);

      // Deduct stock
      await conn.query(
        'UPDATE products SET stock_quantity = stock_quantity - ?, total_sold = total_sold + ? WHERE id = ?',
        [oi.quantity, oi.quantity, oi.product_id]
      );

      // Commission record
      await conn.query(`
        INSERT INTO commissions (order_item_id, vendor_id, order_id, gross_amount, commission_rate, commission_amount, vendor_earnings)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [itemResult.insertId, oi.vendor_id, orderId, oi.total_price,
          oi.commission_rate, oi.commission_amount, oi.vendor_earnings]);

      // Update vendor totals
      await conn.query(
        'UPDATE vendors SET total_sales = total_sales + ?, total_earnings = total_earnings + ? WHERE id = ?',
        [oi.total_price, oi.vendor_earnings, oi.vendor_id]
      );
    }

    await conn.commit();
    return created(res, { orderNumber, uuid, totalAmount }, 'Order placed successfully');
  } catch (err) {
    await conn.rollback();
    return error(res, err.message);
  } finally {
    conn.release();
  }
};

// ── GET /orders  (customer's orders) ─────────────────────────────────────────
const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let where = 'o.customer_id = ?';
    const params = [req.user.id];
    if (status) { where += ' AND o.status = ?'; params.push(status); }

    const [rows] = await db.query(`
      SELECT o.uuid, o.order_number, o.status, o.total_amount, o.payment_status,
             o.created_at,
             COUNT(oi.id) AS item_count
      FROM orders o
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

// ── GET /orders/:uuid ─────────────────────────────────────────────────────────
const getOrderDetails = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.* FROM orders o
      WHERE o.uuid = ? AND (o.customer_id = ? OR ? = 'admin')
    `, [req.params.uuid, req.user.id, req.user.role]);

    if (!orders.length) return notFound(res, 'Order not found');

    const [items] = await db.query(`
      SELECT oi.*, v.shop_name, v.shop_slug,
             pi.image_url AS product_image
      FROM order_items oi
      JOIN vendors v ON v.id = oi.vendor_id
      LEFT JOIN product_images pi ON pi.product_id = oi.product_id AND pi.is_primary = true
      WHERE oi.order_id = ?
    `, [orders[0].id]);

    return success(res, { ...orders[0], items });
  } catch (err) {
    return error(res, err.message);
  }
};

// ── PUT /orders/:uuid/cancel  (customer cancel) ───────────────────────────────
const cancelOrder = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, status FROM orders WHERE uuid = ? AND customer_id = ?",
      [req.params.uuid, req.user.id]
    );
    if (!rows.length)                     return notFound(res, 'Order not found');
    if (!['pending','confirmed'].includes(rows[0].status))
      return badRequest(res, 'Order cannot be cancelled at this stage');

    await db.query("UPDATE orders SET status = 'cancelled' WHERE id = ?", [rows[0].id]);
    await db.query("UPDATE order_items SET item_status = 'cancelled' WHERE order_id = ?", [rows[0].id]);

    return success(res, {}, 'Order cancelled');
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { placeOrder, getMyOrders, getOrderDetails, cancelOrder };
