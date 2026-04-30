const router = require('express').Router();
const ctrl = require('../controllers/product.controller');
const { authenticate, authorize, requireApprovedVendor } = require('../middleware/auth.middleware');

const isApprovedVendor = [authenticate, authorize('vendor'), requireApprovedVendor];

router.get('/vendor/my',          ...isApprovedVendor, ctrl.getMyProducts);
router.post('/vendor/create',     ...isApprovedVendor, ctrl.createProduct);
router.put('/vendor/:uuid',       ...isApprovedVendor, ctrl.updateProduct);
router.delete('/vendor/:uuid',    ...isApprovedVendor, ctrl.deleteProduct);

router.get('/',       ctrl.listProducts);
router.get('/:slug',  ctrl.getProduct);

module.exports = router;