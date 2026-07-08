
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');

const { registerUser, loginUser, adminLogin, googleLogin, getCurrentUser, updateCurrentUser } = require('../controller/user.controller');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin-login', adminLogin);
router.post('/google-login', googleLogin);
router.get('/me', authMiddleware, getCurrentUser);
router.put('/me', authMiddleware, updateCurrentUser);

module.exports = router;
