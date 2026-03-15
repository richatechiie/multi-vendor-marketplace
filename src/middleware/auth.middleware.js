const { verifyAccessToken } = require('../utils/jwt');
const { unauthorized, forbidden } = require('../utils/response');
const db = require('../config/database');

// ── Verify JWT & attach user to req ──────────────────────────────────────────
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res, 'Access token required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    // Fetch fresh user from DB (catches deactivated accounts)
    const [rows] = await db.query(
      'SELECT id, uuid, name, email, role, is_active, is_verified FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!rows.length)       return unauthorized(res, 'User not found');
    if (!rows[0].is_active) return unauthorized(res, 'Account is deactivated');

    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return unauthorized(res, 'Token expired');
    if (err.name === 'JsonWebTokenError') return unauthorized(res, 'Invalid token');
    return unauthorized(res, 'Authentication failed');
  }
};

// ── Role-based authorization ──────────────────────────────────────────────────
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return forbidden(res, `Access denied. Required role(s): ${roles.join(', ')}`);
  }
  next();
};

// ── Vendor must be approved ───────────────────────────────────────────────────
const requireApprovedVendor = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, status FROM vendors WHERE user_id = ?',
      [req.user.id]
    );
    if (!rows.length)              return forbidden(res, 'Vendor profile not found');
    if (rows[0].status !== 'approved') {
      return forbidden(res, `Vendor account is ${rows[0].status}. Awaiting admin approval.`);
    }
    req.vendor = rows[0];
    next();
  } catch {
    return forbidden(res, 'Vendor verification failed');
  }
};

module.exports = { authenticate, authorize, requireApprovedVendor };
