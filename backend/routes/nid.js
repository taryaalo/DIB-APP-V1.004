const express = require('express');
const router = express.Router();
const { getSsoToken, validateNid, checkNidState, isPhoneMatching } = require('../services/nidService');

router.post('/validate', async (req, res) => {
  const { nid } = req.body;
  if (!nid) {
    return res.status(400).json({ error: 'NID is required' });
  }

  try {
    const token = await getSsoToken();
    const validationResult = await validateNid(nid, token);
    res.json(validationResult);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/state', async (req, res) => {
    try {
        const token = await getSsoToken();
        const state = await checkNidState(token);
        res.json(state);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/phone/match', async (req, res) => {
    const { nid, phone } = req.body;
    if (!nid || !phone) {
        return res.status(400).json({ error: 'NID and phone are required' });
    }

    try {
        const token = await getSsoToken();
        const matchResult = await isPhoneMatching(nid, phone, token);
        res.json(matchResult);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
