const express = require('express');
const router = express.Router();

router.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

router.use(require('./log'));
router.use(require('./branches'));
router.use(require('./countries'));
router.use(require('./cities'));
router.use(require('./incomeSources'));
router.use(require('./cache'));
router.use(require('./documents'));
router.use(require('./applications'));

module.exports = router;
