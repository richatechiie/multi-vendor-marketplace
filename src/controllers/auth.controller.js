const bcrypt   = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db       = require('../config/database');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { success, created, error, unauthorized, badRequest } = require('../utils/response');

// ── POST /auth/register ───────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'customer', phone } = req.body;

    // Prevent direct admin registration
    if (role === 'admin') return badRequest(res, 'Cannot register as admin');

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return badRequest(res, 'Email already registered');

    const hash = await bcrypt.hash(password, 12);
    const uuid = uuidv4();

    const [result] = await db.query(
      `INSERT INTO users (uuid, name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?, ?)`,
      [uuid, name, email, hash, role, phone || null]
    );

    const userId = result.insertId;

    // Auto-create vendor profile if role is vendor
    if (role === 'vendor') {
      const shopName = `${name}'s Shop`;
      const shopSlug = shopName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
      await db.query(
        `INSERT INTO vendors (user_id, shop_name, shop_slug, status, commission_rate) VALUES (?, ?, ?, 'pending', ?)`,
        [userId, shopName, shopSlug, process.env.DEFAULT_COMMISSION_RATE || 10]
      );
    }

    return created(res, { uuid, email, role }, 'Registration successful. ' + (role === 'vendor' ? 'Awaiting admin approval.' : 'Welcome!'));
  } catch (err) {
    return error(res, err.message);
  }
};

// ── POST /auth/login ──────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return unauthorized(res, 'Invalid email or password');

    const user = rows[0];
    if (!user.is_active) return unauthorized(res, 'Account is deactivated');

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return unauthorized(res, 'Invalid email or password');

    const payload       = { id: user.id, uuid: user.uuid, role: user.role };
    const accessToken   = generateAccessToken(payload);
    const refreshToken  = generateRefreshToken(payload);

    // Store refresh token hash
    await db.query('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, user.id]);

    // For vendors, attach approval status
    let vendorStatus = null;
    if (user.role === 'vendor') {
      const [vRows] = await db.query('SELECT status, id FROM vendors WHERE user_id = ?', [user.id]);
      vendorStatus = vRows[0] || null;
    }

    return success(res, {
      accessToken,
      refreshToken,
      user: {
        id         : user.uuid,
        name       : user.name,
        email      : user.email,
        role       : user.role,
        isVerified : user.is_verified,
        vendorStatus,
      },
    }, 'Login successful');
  } catch (err) {
    return error(res, err.message);
  }
};

// ── POST /auth/refresh ────────────────────────────────────────────────────────
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return badRequest(res, 'Refresh token required');

    const decoded = verifyRefreshToken(refreshToken);

    const [rows] = await db.query(
      'SELECT * FROM users WHERE id = ? AND refresh_token = ?',
      [decoded.id, refreshToken]
    );
    if (!rows.length) return unauthorized(res, 'Invalid refresh token');

    const user = rows[0];
    const payload      = { id: user.id, uuid: user.uuid, role: user.role };
    const newAccess    = generateAccessToken(payload);
    const newRefresh   = generateRefreshToken(payload);

    await db.query('UPDATE users SET refresh_token = ? WHERE id = ?', [newRefresh, user.id]);

    return success(res, { accessToken: newAccess, refreshToken: newRefresh }, 'Tokens refreshed');
  } catch (err) {
    return unauthorized(res, 'Invalid or expired refresh token');
  }
};

// ── POST /auth/logout ─────────────────────────────────────────────────────────
const logout = async (req, res) => {
  try {
    await db.query('UPDATE users SET refresh_token = NULL WHERE id = ?', [req.user.id]);
    return success(res, {}, 'Logged out successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

// ── GET /auth/me ──────────────────────────────────────────────────────────────
const me = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, uuid, name, email, role, phone, avatar_url, is_verified, is_active, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    return success(res, rows[0]);
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { register, login, refresh, logout, me };
