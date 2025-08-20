const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/api/cache-form', (req, res) => {
  req.session.form = req.body || {};
  res.json({ success: true });
});

router.get('/api/cache-form', (req, res) => {
  res.json(req.session.form || {});
});

router.post('/api/cache-upload', upload.single('file'), (req, res) => {
  const docType = req.body.docType;
  if (req.file && docType) {
    if (!req.session.uploads) {
        req.session.uploads = {};
    }
    req.session.uploads[docType] = req.file.path;
  }
  res.json({ uploaded: true });
});

router.get('/api/cached-uploads', (req, res) => {
    res.json(req.session.uploads || {});
});

router.post('/api/cache-extracted', (req, res) => {
  const { docType, data } = req.body || {};
  if (!docType) return res.status(400).json({ error: 'missing_doc_type' });
    if (!req.session.extracted) {
        req.session.extracted = {};
    }
  req.session.extracted[docType] = data || {};
  res.json({ success: true });
});

router.get('/api/cache-extracted/:docType', (req, res) => {
    const docType = req.params.docType;
    res.json((req.session.extracted && req.session.extracted[docType]) || {});
});

router.post('/api/clear-cache', (req, res) => {
    req.session.form = {};
    req.session.uploads = {};
    req.session.extracted = {};
    res.json({ success: true });
});

module.exports = router;
