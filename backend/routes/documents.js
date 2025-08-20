const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { isAuthenticated } = require('../middleware/auth');
const pool = require('../config/db');
const { logActivity, logError } = require('../utils/logger');
const path = require('path');
const fs = require('fs');
const userDocsBase = path.join(__dirname, '..', '..', 'src', 'user_document');


router.post('/api/add-document', isAuthenticated, upload.single('file'), async (req, res) => {
    const { reference, nid, docType } = req.body || {};
    if (!req.file || (!reference && !nid) || !docType) {
      return res.status(400).json({ error: 'missing_parameters' });
    }
    try {
      let personal;
      if (reference) {
        personal = await pool.query('SELECT id, national_id FROM personal_info WHERE reference_number=$1', [reference]);
      } else {
        personal = await pool.query('SELECT id, national_id FROM personal_info WHERE national_id=$1 ORDER BY created_at DESC LIMIT 1', [nid]);
      }
      if (personal.rows.length === 0) return res.status(404).json({ error: 'not_found' });
      const pid = personal.rows[0].id;
      const nat = personal.rows[0].national_id;
      const refResult = await pool.query('SELECT reference_number FROM personal_info WHERE id=$1', [pid]);
      const refNum = refResult.rows[0].reference_number;
      const dir = path.join(userDocsBase, refNum);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const newPath = path.join(dir, path.basename(req.file.path));
      fs.renameSync(req.file.path, newPath);
      const ins = await pool.query('INSERT INTO uploaded_documents (personal_id, national_id, doc_type, file_name, reference_number) VALUES ($1,$2,$3,$4,$5) RETURNING id', [pid, nat, docType, newPath, refNum]);
      logActivity(`DOC_ADDED ${refNum}`);
      res.json({ id: ins.rows[0].id, referenceNumber: refNum, path: newPath });
    } catch (e) {
      logError(`ADD_DOC_ERROR ${e.message}`);
      res.status(500).json({ error: 'server_error' });
    }
});

router.post('/api/update-document/:id', isAuthenticated, upload.single('file'), async (req, res) => {
    const docId = req.params.id;
    if (!req.file) return res.status(400).json({ error: 'missing_file' });
    try {
      const existing = await pool.query('SELECT personal_id, file_name FROM uploaded_documents WHERE id=$1', [docId]);
      if (existing.rows.length === 0) return res.status(404).json({ error: 'not_found' });
      const oldPath = existing.rows[0].file_name;
      const dir = path.dirname(oldPath);
      const newPath = path.join(dir, path.basename(req.file.path));
      fs.renameSync(req.file.path, newPath);
      const refRes = await pool.query('SELECT reference_number FROM personal_info WHERE id=$1', [existing.rows[0].personal_id]);
      const refNum = refRes.rows[0].reference_number;
      await pool.query('UPDATE uploaded_documents SET file_name=$1, confirmed_by_admin=FALSE, reference_number=$2 WHERE id=$3', [newPath, refNum, docId]);
      logActivity(`DOC_UPDATED ${docId}`);
      res.json({ path: newPath });
    } catch (e) {
      logError(`DOC_UPDATE_ERROR ${e.message}`);
      res.status(500).json({ error: 'server_error' });
    }
});

router.post('/api/approve-document', isAuthenticated, async (req, res) => {
    const { id, approved, adminName } = req.body || {};
    if (!id) return res.status(400).json({ error: 'missing_id' });
    try {
      const adminIp = (req.headers['x-forwarded-for'] || req.ip || '').split(',')[0];
      await pool.query('UPDATE uploaded_documents SET confirmed_by_admin=$1, approved_by_admin_name=$2, approved_by_admin_ip=$3 WHERE id=$4', [approved, adminName || null, adminIp, id]);
      logActivity(`DOC_APPROVE ${id} ${approved} ${adminName || ''} ${adminIp}`);
      res.json({ success: true });
    } catch (e) {
      logError(`DOC_APPROVE_ERROR ${e.message}`);
      res.status(500).json({ error: 'server_error' });
    }
});

module.exports = router;
