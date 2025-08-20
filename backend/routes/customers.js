const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const { pool } = require('../config/db');
const { logActivity, logError } = require('../utils/logger');
const axios = require('axios');

router.post('/api/create-custid', isAuthenticated, async (req, res) => {
    const { reference, admin } = req.body || {};
    if (!reference) return res.status(400).json({ error: 'missing_reference' });
    try {
      const pres = await pool.query('SELECT * FROM personal_info WHERE reference_number=$1', [reference]);
      if (pres.rows.length === 0) return res.status(404).json({ error: 'not_found' });
      const p = pres.rows[0];
      const ares = await pool.query('SELECT * FROM address_info WHERE personal_id=$1 ORDER BY id DESC LIMIT 1', [p.id]);
      const wres = await pool.query('SELECT * FROM work_income_info WHERE personal_id=$1 ORDER BY id DESC LIMIT 1', [p.id]);
      const a = ares.rows[0] || {};
      const w = wres.rows[0] || {};
      const cityAddr = a.city ? await pool.query('SELECT name_ar, name_en FROM cities WHERE city_code=$1', [a.city]) : { rows: [{}] };
      const countryAddr = a.country ? await pool.query('SELECT name_ar FROM countries WHERE code=$1', [a.country]) : { rows: [{}] };
      const workCity = w.work_city ? await pool.query('SELECT name_ar FROM cities WHERE city_code=$1', [w.work_city]) : { rows: [{}] };
      const birthCountryRes = p.birth_place ? await pool.query('SELECT country_code FROM cities WHERE name_en=$1 LIMIT 1', [p.birth_place]) : { rows: [{}] };
      const birthCountry = birthCountryRes.rows[0]?.country_code || a.country || '';
      const digits = (p.phone || '').replace(/\D/g, '');
      const mobisdno = digits.slice(0,3);
      const mobnum = digits.slice(3);
      const fmt = (d) => d ? new Date(d).toISOString().split('T')[0] : null;
      const payload = {
        branch: String(p.branch_id || ''),
        private_customer: 'N',
        name: p.full_name,
        fullname: p.full_name,
        sname: p.national_id || '',
        nlty: a.country || '',
        addrln1: cityAddr.rows[0]?.name_ar || '',
        addrln4: countryAddr.rows[0]?.name_ar || '',
        country: a.country || '',
        ccateg: p.service_type === 'personal' ? 'INDIVIDUAL' : 'CORPORATE',
        media: 'MAIL',
        loc: a.city || '',
        p_address_code: cityAddr.rows[0]?.name_en || '',
        track_limits: 'Y',
        lang: p.language === 'en' ? 'ENG' : 'ARB',
        gendr: p.gender === 'F' ? 'F' : 'M',
        dob: fmt(p.dob),
        birth_country: birthCountry,
        nationid: p.national_id || '',
        cust_comm_mode: p.phone ? 'M' : 'E',
        pptno: p.passport_number || '',
        pptissdt: fmt(p.passport_issue_date),
        pptexpdt: fmt(p.passport_expiry_date),
        mobisdno,
        mobnum,
        emailid: p.email || '',
        birthcountry: birthCountry,
        mothermaidn_name: p.mother_full_name || '',
        liab_ccy: 'LYD',
        work_place: workCity.rows[0]?.name_ar || ''
      };
      const respApi = await axios.post(process.env.CUST_API_URL, payload, { headers: { Authorization: `Bearer ${process.env.CUST_API_TOKEN}` } });
      const data = respApi.data;
      let custId;
      if (data && typeof data === 'object' && data.CUSTID) {
        custId = data.CUSTID;
      } else if (typeof data === 'string') {
        const match = data.match(/<CUSTID>\s*([^<]+)<\/CUSTID>/i);
        if (match) {
          custId = match[1].trim().replace(/^>/, '');
        }
      }
      if (custId) {
        await pool.query('INSERT INTO customer_details (personal_info_id, customer_id, created_at, created_by) VALUES ($1,$2,NOW(),$3)', [p.id, custId, admin || 'admin']);
        logActivity(`CUSTOMER_API_RESPONSE ${JSON.stringify({ CUSTID: custId })}`);
        res.json({ CUSTID: custId });
      } else {
        let errText = 'custid_missing';
        if (typeof data === 'string') {
          const matches = [...data.matchAll(/<error>([^<]+)<\/error>/gi)];
          if (matches.length) {
            errText = matches.map(m => m[1].trim()).join('; ');
          }
        }
        logError(`CREATE_CUSTID_INVALID_RESPONSE ${typeof data === 'string' ? data : JSON.stringify(data)}`);
        res.status(500).json({ error: errText });
      }
    } catch (e) {
      let errText = 'server_error';
      if (e.response?.data && typeof e.response.data === 'string') {
        const matches = [...e.response.data.matchAll(/<error>([^<]+)<\/error>/gi)];
        if (matches.length) {
          errText = matches.map(m => m[1].trim()).join('; ');
        }
      }
      logError(`CREATE_CUSTID_ERROR ${e.message}`);
      res.status(500).json({ error: errText });
    }
});

module.exports = router;
