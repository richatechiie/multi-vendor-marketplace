const router = require('express').Router();
const ctrl = require('../controllers/product.controller');
const { authenticate, authorize, requireApprovedVendor } = require('../middleware/auth.middleware');

const isApprovedVendor = [authenticate, authorize('vendor'), requireApprovedVendor];

// Vendor product management (must be BEFORE /:slug wildcard)
router.get('/vendor/my',          ...isApprovedVendor, ctrl.getMyProducts);
router.post('/vendor/create',     ...isApprovedVendor, ctrl.createProduct);
router.put('/vendor/:uuid',       ...isApprovedVendor, ctrl.updateProduct);
router.delete('/vendor/:uuid',    ...isApprovedVendor, ctrl.deleteProduct);

// Public (/:slug must be LAST — it catches everything)
router.get('/',       ctrl.listProducts);
router.get('/:slug',  ctrl.getProduct);

module.exports = router;