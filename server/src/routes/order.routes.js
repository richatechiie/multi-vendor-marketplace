const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/order.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const isCustomer = [authenticate, authorize('customer')];
const isAuth     = [authenticate];

const orderRules = [
  body('items').isArray({ min: 1 }).withMessage('Items array required'),
  body('items.*.product_uuid').notEmpty().withMessage('Product UUID required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shipping.name').notEmpty().withMessage('Shipping name required'),
  body('shipping.address').notEmpty().withMessage('Shipping address required'),
  body('shipping.city').notEmpty().withMessage('Shipping city required'),
  body('shipping.country').notEmpty().withMessage('Shipping country required'),
];

router.post('/',             ...isCustomer, orderRules, validate, ctrl.placeOrder);
router.get('/',              ...isCustomer, ctrl.getMyOrders);
router.get('/:uuid',         ...isAuth,     ctrl.getOrderDetails);
router.put('/:uuid/cancel',  ...isCustomer, ctrl.cancelOrder);

module.exports = router;
