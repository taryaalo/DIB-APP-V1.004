const express = require('express');
const router = express.Router();
const { IncomeSource } = require('../models');
const { logError } = require('../utils/logger');

router.get('/api/income-sources', async (req, res) => {
  try {
    const incomeSources = await IncomeSource.findAll({
        order: [['id', 'ASC']]
    });
    res.json(incomeSources);
  } catch (e) {
    logError(`INCOME_SOURCES_ERROR ${e.message}`);
    res.status(500).json({ error: 'failed' });
  }
});

module.exports = router;
