const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const pool = require('../config/db');
const { logActivity, logError } = require('../utils/logger');

router.post('/api/application-status', isAuthenticated, async (req, res) => {
    const { id, status, adminName } = req.body || {};
    if (!id || !status) return res.status(400).json({ error: 'missing_parameters' });
    try {
      const approved = status === 'Approved';
      const adminIp = (req.headers['x-forwarded-for'] || req.ip || '').split(',')[0];
      await pool.query('UPDATE personal_info SET confirmed_by_admin=$1, approved_by_admin_name=$2, approved_by_admin_ip=$3 WHERE id=$4', [approved, adminName || null, adminIp, id]);
      logActivity(`APP_STATUS ${id} ${status} ${adminName || ''} ${adminIp}`);
      res.json({ success: true });
    } catch (e) {
      logError(`APP_STATUS_ERROR ${e.message}`);
      res.status(500).json({ error: 'server_error' });
    }
});

router.get('/api/applications', isAuthenticated, async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM personal_info ORDER BY created_at DESC');
      const apps = [];
      for (const p of result.rows) {
        const address = await pool.query('SELECT * FROM address_info WHERE personal_id=$1 LIMIT 1', [p.id]);
        const work = await pool.query('SELECT * FROM work_income_info WHERE personal_id=$1 LIMIT 1', [p.id]);
        const docs = await pool.query('SELECT id, doc_type, file_name, reference_number, confirmed_by_admin FROM uploaded_documents WHERE personal_id=$1', [p.id]);

        const branchRow = p.branch_id ? await pool.query('SELECT name_en FROM bank_branches WHERE branch_id=$1', [p.branch_id]) : null;
        const branchName = branchRow?.rows?.[0]?.name_en || null;

        let cityCode = address.rows[0]?.city || null;
        let cityName = null;
        if (cityCode) {
          let cityRow = await pool.query('SELECT city_code, name_en FROM cities WHERE city_code=$1', [cityCode]);
          if (cityRow.rows.length === 0) {
            cityRow = await pool.query('SELECT city_code, name_en FROM cities WHERE name_en=$1 OR name_ar=$1', [cityCode]);
          }
          if (cityRow.rows.length > 0) {
            cityCode = cityRow.rows[0].city_code;
            cityName = cityRow.rows[0].name_en;
          }
        }

        apps.push({
          personalInfo: { ...p, branch_name: branchName, city_code: cityCode, city_name: cityName },
          addressInfo: address.rows[0] || null,
          workInfo: work.rows[0] || null,
          uploadedDocuments: docs.rows,
          status: p.confirmed_by_admin ? 'Approved' : 'Pending'
        });
      }
      res.json(apps);
    } catch (e) {
      logError(`GET_APPS_ERROR ${e.message}`);
      res.status(500).json({ error: 'server_error' });
    }
});

module.exports = router;
