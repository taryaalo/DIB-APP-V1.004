const express = require('express');
const router = express.Router();
const { Country } = require('../models');
const { logError } = require('../utils/logger');

router.get('/api/countries', async (req, res) => {
  try {
    const countries = await Country.findAll({
        order: [
            [Country.sequelize.literal("CASE WHEN code='LY' THEN 0 ELSE 1 END")],
            ['nameEn', 'ASC']
        ]
    });
    res.json(countries);
  } catch (e) {
    logError(`COUNTRIES_ERROR ${e.message}`);
    res.status(500).json({ error: 'failed' });
  }
});

module.exports = router;
