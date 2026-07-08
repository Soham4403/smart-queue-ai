const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const {
    chatAssistant,
    recommendAssistant,
    bookAssistant,
    voiceAssistant
} = require('../controller/ai.controller');

const router = express.Router();

router.post('/chat', chatAssistant);
router.post('/recommend', recommendAssistant);
router.post('/voice', voiceAssistant);
router.post('/book', authMiddleware, bookAssistant);

module.exports = router;
