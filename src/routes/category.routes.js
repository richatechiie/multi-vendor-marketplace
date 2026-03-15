const router = require('express').Router();
const db = require('../config/database');
const { success, created, error, notFound } = require('../utils/response');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const isAdmin = [authenticate, authorize('admin')];

// GET all categories (public)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, slug, description, parent_id, image_url
       FROM categories WHERE is_active = true ORDER BY name`
    );
    return success(res, rows);
  } catch (err) { return error(res, err.message); }
});

// POST create category (admin)
router.post('/', ...isAdmin, async (req, res) => {
  try {
    const { name, description, parent_id, image_url } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    await db.query(
      'INSERT INTO categories (name, slug, description, parent_id, image_url) VALUES (?,?,?,?,?)',
      [name, slug, description || null, parent_id || null, image_url || null]
    );
    return created(res, { slug }, 'Category created');
  } catch (err) { return error(res, err.message); }
});

// PUT update category (admin)
router.put('/:id', ...isAdmin, async (req, res) => {
  try {
    const { name, description, is_active } = req.body;
    await db.query(
      'UPDATE categories SET name=?, description=?, is_active=? WHERE id=?',
      [name, description, is_active, req.params.id]
    );
    return success(res, {}, 'Category updated');
  } catch (err) { return error(res, err.message); }
});

// DELETE (soft) category (admin)
router.delete('/:id', ...isAdmin, async (req, res) => {
  try {
    await db.query('UPDATE categories SET is_active = false WHERE id = ?', [req.params.id]);
    return success(res, {}, 'Category deactivated');
  } catch (err) { return error(res, err.message); }
});

module.exports = router;
