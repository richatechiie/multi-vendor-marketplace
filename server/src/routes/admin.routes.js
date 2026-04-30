const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const isAdmin = [authenticate, authorize('admin')];

// Vendor management
router.get('/vendors',                          ...isAdmin, ctrl.listVendors);
router.put('/vendors/:id/approve',              ...isAdmin, ctrl.approveVendor);
router.put('/vendors/:id/reject',               ...isAdmin, ctrl.rejectVendor);
router.put('/vendors/:id/suspend',              ...isAdmin, ctrl.suspendVendor);
router.put('/vendors/:id/commission',
  ...isAdmin,
  body('commission_rate').isFloat({ min: 0, max: 100 }).withMessage('Rate between 0–100'),
  validate,
  ctrl.updateCommission
);

// Order management
router.get('/orders',                           ...isAdmin, ctrl.listOrders);
router.put('/orders/:uuid/status',              ...isAdmin, ctrl.updateOrderStatus);

// Commission management
router.get('/commissions',                      ...isAdmin, ctrl.listCommissions);
router.put('/commissions/:id/pay',              ...isAdmin, ctrl.markCommissionPaid);

// Platform analytics
router.get('/analytics',                        ...isAdmin, ctrl.getPlatformAnalytics);

// User management
router.get('/users',                            ...isAdmin, ctrl.listUsers);
router.put('/users/:id/toggle',                 ...isAdmin, ctrl.toggleUserStatus);

module.exports = router;
