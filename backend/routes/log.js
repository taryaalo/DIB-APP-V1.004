const express = require('express');
const router = express.Router();
const { logActivity, logError } = require('../utils/logger');

router.post('/api/log-activity', async (req, res) => {
  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: 'missing_message' });
  await logActivity(`CLIENT_LOG ${message}`);
  res.json({ success: true });
});

router.post('/api/error-log', async (req, res) => {
    const { message } = req.body || {};
    if (message) {
        await logError(message);
    }
    res.json({ success: true });
});

router.post('/api/log', async (req, res) => {
    const { message } = req.body || {};
    if (message) {
        await logActivity(message);
    }
    res.json({ success: true });
});

module.exports = router;
