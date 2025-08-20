const express = require('express');
const router = express.Router();
const { BankBranch } = require('../models');
const { logError } = require('../utils/logger');

router.get('/api/branches', async (req, res) => {
  try {
    const branches = await BankBranch.findAll({
        order: [['branchId', 'ASC']]
    });
    res.json(branches);
  } catch (e) {
    logError(`BRANCHES_ERROR ${e.message}`);
    res.status(500).json({ error: 'failed' });
  }
});

module.exports = router;
