const router = require('express').Router();
const ctrl = require('../controllers/vendor.controller');
const { authenticate, authorize, requireApprovedVendor } = require('../middleware/auth.middleware');

const isVendor = [authenticate, authorize('vendor')];
const isApprovedVendor = [...isVendor, requireApprovedVendor];

router.get('/profile',                   ...isVendor,         ctrl.getMyProfile);
router.put('/profile',                   ...isVendor,         ctrl.updateProfile);
router.get('/dashboard',                 ...isApprovedVendor, ctrl.getDashboard);
router.get('/orders',                    ...isApprovedVendor, ctrl.getOrders);
router.put('/orders/:itemId/status',     ...isApprovedVendor, ctrl.updateOrderItemStatus);
router.get('/analytics',                 ...isApprovedVendor, ctrl.getAnalytics);

module.exports = router;