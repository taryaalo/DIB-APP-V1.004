const express = require('express');
const router = express.Router();
const { City } = require('../models');
const { logError } = require('../utils/logger');

router.get('/api/cities', async (req, res) => {
  try {
    const country = req.query.country;
    let cities;
    if (country) {
        cities = await City.findAll({
            where: { countryCode: country },
            order: [['nameEn', 'ASC']]
        });
    } else {
        cities = await City.findAll({
            order: [['countryCode', 'ASC'], ['nameEn', 'ASC']]
        });
    }
    res.json(cities);
  } catch (e) {
    logError(`CITIES_ERROR ${e.message}`);
    res.status(500).json({ error: 'failed' });
  }
});

module.exports = router;
