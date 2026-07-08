const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const {
    createCheckoutOrder,
    verifyAndBookAppointment
} = require('../controller/payment.controller');

const router = express.Router();

router.post('/order', authMiddleware, createCheckoutOrder);
router.post('/verify', authMiddleware, verifyAndBookAppointment);

module.exports = router;
