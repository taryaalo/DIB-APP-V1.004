// server.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const userDocsBase = path.join(__dirname, '..', 'src', 'user_document');
const axios = require('axios');
const nodemailer = require('nodemailer');
const xml2js = require('xml2js');
const { callChatGPT, callGemini } = require('./services/ai');
const pool = require('./config/db');

function normalizeDate(dateString) {
  if (!dateString || typeof dateString !== 'string') return null;
  const direct = dateString.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (direct) {
    const [ , d, m, y ] = direct;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const monthMap = {
    jan: '01', january: '01', 'يناير': '01',
    feb: '02', february: '02', 'فبراير': '02',
    mar: '03', march: '03', 'مارس': '03',
    apr: '04', april: '04', 'أبريل': '04',
    may: '05', 'مايو': '05',
    jun: '06', june: '06', 'يونيو': '06',
    jul: '07', july: '07', 'يوليو': '07',
    aug: '08', august: '08', 'أغسطس': '08',
    sep: '09', september: '09', 'سبتمبر': '09',
    oct: '10', october: '10', 'أكتوبر': '10',
    nov: '11', november: '11', 'نوفمبر': '11',
    dec: '12', december: '12', 'ديسمبر': '12',
  };

  const parts = dateString.split(/[\s,-]+/);
  if (parts.length !== 3) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    return null;
  }

  let day, month, year;
  const [p1, p2, p3] = parts;
  if (!isNaN(p1) && isNaN(p2) && !isNaN(p3)) {
    day = p1; month = p2; year = p3;
  } else if (!isNaN(p1) && !isNaN(p2) && isNaN(p3)) {
    return `${p3}-${p2.padStart(2, '0')}-${p1.padStart(2, '0')}`;
  } else if (!isNaN(p1) && !isNaN(p2) && !isNaN(p3)) {
    if (p1.length === 4) {
      return `${p1}-${p2.padStart(2, '0')}-${p3.padStart(2, '0')}`;
    } else if (p3.length === 4) {
      return `${p3}-${p2.padStart(2, '0')}-${p1.padStart(2, '0')}`;
    } else {
      return null;
    }
  } else {
    year = p1; month = p2; day = p3;
  }

  const monthNumber = monthMap[String(month).toLowerCase()];
  if (!monthNumber) return null;
  return `${year}-${monthNumber}-${String(day).padStart(2, '0')}`;
}

require('dotenv').config();

const { logActivity, logError, logEmailDebug } = require('./utils/logger');
const { sanitize } = require('./utils/sanitizer');
const { isAuthenticated } = require('./middleware/auth');

const https = require('https');
const http = require('http');

const app = require('./config/app');
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'));
        }
    }
});
const HTTP_PORT = process.env.PORT || 7003;



async function getTemplate(key, media) {
  const res = await pool.query(
    'SELECT english_template, arabic_template FROM message_templates WHERE template_key=$1 AND media=$2 LIMIT 1',
    [key, media]
  );
  return res.rows[0] || null;
}

function fillTemplate(tpl, params) {
  const filled = tpl.replace(/{{(.*?)}}/g, (_, k) => params[k] || '');
  return filled.replace(/\/n/g, '\n');
}


app.post('/api/save-selfie', async (req, res) => {
  const { referenceNumber, photos, data } = req.body || {};
  if (!referenceNumber || !photos || !data) return res.status(400).json({ error: 'missing_data' });
  try {
    const dir = path.join(userDocsBase, referenceNumber, 'selfie');
    fs.mkdirSync(dir, { recursive: true });
    const photoPaths = {};
    for (const [key, dataUrl] of Object.entries(photos)) {
      const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64, 'base64');
      const filePath = path.join(dir, `${key}.jpg`);
      fs.writeFileSync(filePath, buffer);
      photoPaths[key] = path.relative(userDocsBase, filePath).replace(/\\/g, '/');
    }
    const jsonPath = path.join(dir, 'facial_analysis_all_stages.json');
    fs.writeFileSync(jsonPath, JSON.stringify(data));
    await pool.query(
      'INSERT INTO selfie_data(reference_number, photo_paths, descriptors) VALUES($1,$2,$3) ON CONFLICT (reference_number) DO UPDATE SET photo_paths=$2, descriptors=$3',
      [referenceNumber, photoPaths, data]
    );
    res.json({ success: true });
  } catch (e) {
    logError(`SAVE_SELFIE_ERROR ${e.message}`);
    res.status(500).json({ error: 'failed' });
  }
});


const otpStore = {};



function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

async function sendOtpSms(phone, code, language = 'ar') {
  const url = process.env.SMS_API_URL;
  const token = process.env.SMS_API_TOKEN;
  if (!url || !token) return;
  try {
    let message = `Your OTP code is ${code}`;
    const tpl = await getTemplate('otp', 'sms');
    if (tpl) {
      const tplText = language === 'en' ? tpl.english_template : tpl.arabic_template;
      message = fillTemplate(tplText, { code });
    }
    const payload = {
      api_token: token,
      recipient: phone,
      sender_id: process.env.SMS_SENDER_ID || '16661',
      type: 'plain',
      message,
    };
    logActivity(`SMS_CONNECT ${url}`);
    logActivity(`SMS_POST ${JSON.stringify(payload)}`);
    const resp = await axios.post(
      url,
      payload
    );
    logActivity(`SMS_RESPONSE ${resp.status} ${JSON.stringify(resp.data)}`);
    logActivity(`SMS_SENT ${phone}`);
  } catch (e) {
    const status = e.response?.status;
    const data = e.response?.data;
    logError(`SMS_ERROR ${e.message} ${status || ''} ${data ? JSON.stringify(data) : ''}`);
  }
}

const mailTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

async function sendOtpEmail(email, code, language = 'en') {
  if (!process.env.SMTP_HOST) return;
  let message = `Your OTP code is ${code}`;
  const tpl = await getTemplate('otp', 'email');
  if (tpl) {
    const tplText = language === 'ar' ? tpl.arabic_template : tpl.english_template;
    message = fillTemplate(tplText, { code });
  }
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'OTP Verification',
    text: message,
  };
  try {
    const conn = `${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 587}`;
    logActivity(`EMAIL_CONNECT ${conn}`);
    logActivity(`EMAIL_POST ${JSON.stringify(mailOptions)}`);
    logEmailDebug(`CONNECT ${conn}`);
    logEmailDebug(`POST ${JSON.stringify(mailOptions)}`);
    const info = await mailTransport.sendMail(mailOptions);
    logActivity(`EMAIL_RESPONSE ${info.response || ''}`);
    logActivity(`EMAIL_SENT ${email}`);
    logEmailDebug(`RESPONSE ${info.response || ''}`);
  } catch (e) {
    logError(`EMAIL_ERROR ${e.message}`);
    logEmailDebug(`ERROR ${e.message}`);
  }
}

async function sendGenericSms(phone, message) {
  const url = process.env.SMS_API_URL;
  const token = process.env.SMS_API_TOKEN;
  if (!url || !token || !phone) return;
  try {
    const payload = {
      api_token: token,
      recipient: phone,
      sender_id: process.env.SMS_SENDER_ID || '16661',
      type: 'plain',
      message,
    };
    logActivity(`SMS_CONNECT ${url}`);
    logActivity(`SMS_POST ${JSON.stringify(payload)}`);
    const resp = await axios.post(
      url,
      payload
    );
    logActivity(`SMS_RESPONSE ${resp.status} ${JSON.stringify(resp.data)}`);
    logActivity(`SMS_SENT ${phone}`);
  } catch (e) {
    const status = e.response?.status;
    const data = e.response?.data;
    logError(`SMS_ERROR ${e.message} ${status || ''} ${data ? JSON.stringify(data) : ''}`);
  }
}

async function sendGenericEmail(email, subject, message) {
  if (!process.env.SMTP_HOST || !email) return;
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject,
    text: message,
  };
  try {
    const conn = `${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 587}`;
    logActivity(`EMAIL_CONNECT ${conn}`);
    logActivity(`EMAIL_POST ${JSON.stringify(mailOptions)}`);
    logEmailDebug(`CONNECT ${conn}`);
    logEmailDebug(`POST ${JSON.stringify(mailOptions)}`);
    const info = await mailTransport.sendMail(mailOptions);
    logActivity(`EMAIL_RESPONSE ${info.response || ''}`);
    logActivity(`EMAIL_SENT ${email}`);
    logEmailDebug(`RESPONSE ${info.response || ''}`);
  } catch (e) {
    logError(`EMAIL_ERROR ${e.message}`);
    logEmailDebug(`ERROR ${e.message}`);
  }
}

app.post('/api/send-otp', (req, res) => {
  const { phone, email, language } = req.body || {};
  if (!phone && !email) return res.status(400).json({ error: 'missing_contact' });

  const sanitizedPhone = phone ? sanitize(phone) : null;
  const sanitizedEmail = email ? sanitize(email) : null;

  if (sanitizedPhone) {
    const code = generateOtp();
    otpStore[`phone:${sanitizedPhone}`] = { code, expires: Date.now() + 5 * 60 * 1000 };
    sendOtpSms(sanitizedPhone, code, language || 'ar');
    logActivity(`OTP_SENT_PHONE ${sanitizedPhone} ${code}`);
  }

  if (sanitizedEmail) {
    const code = generateOtp();
    otpStore[`email:${sanitizedEmail}`] = { code, expires: Date.now() + 5 * 60 * 1000 };
    sendOtpEmail(sanitizedEmail, code, language || 'en');
    logActivity(`OTP_SENT_EMAIL ${sanitizedEmail} ${code}`);
  }

  res.json({ success: true });
});

app.post('/api/verify-otp', (req, res) => {
  const { phone, email, otp } = req.body || {};
  const sanitizedPhone = phone ? sanitize(phone) : null;
  const sanitizedEmail = email ? sanitize(email) : null;
  const sanitizedOtp = otp ? sanitize(otp) : null;

  const key = sanitizedPhone ? `phone:${sanitizedPhone}` : `email:${sanitizedEmail}`;
  const entry = otpStore[key];
  if (entry && entry.code === String(sanitizedOtp) && Date.now() <= entry.expires) {
    delete otpStore[key];
    return res.json({ verified: true });
  }
  res.json({ verified: false });
});


app.post('/api/update-personal-info', isAuthenticated, async (req, res) => {
  const { reference_number, ...fields } = req.body;
  if (!reference_number) return res.status(400).json({ error: 'missing_reference_number' });

  for (const key in fields) {
    if (typeof fields[key] === 'string') {
        fields[key] = sanitize(fields[key]);
    }
  }

  const needNameUpdate = ['first_name_ar','middle_name_ar','last_name_ar','surname_ar'].some(f => fields[f] !== undefined);
  if (needNameUpdate) {
    try {
      const cur = await pool.query('SELECT first_name_ar, middle_name_ar, last_name_ar, surname_ar FROM personal_info WHERE reference_number=$1', [reference_number]);
      const existing = cur.rows[0] || {};
      const fullArabicName = [
        fields.first_name_ar !== undefined ? fields.first_name_ar : existing.first_name_ar,
        fields.middle_name_ar !== undefined ? fields.middle_name_ar : existing.middle_name_ar,
        fields.last_name_ar !== undefined ? fields.last_name_ar : existing.last_name_ar,
        fields.surname_ar !== undefined ? fields.surname_ar : existing.surname_ar
      ].filter(Boolean).join(' ');
      fields.full_name = fullArabicName;
    } catch (e) {
      logError(`FULLNAME_FETCH_ERROR ${e.message}`);
    }
  }

  const allowedFields = Object.keys(fields).filter(k => !['id', 'created_at', 'reference_number', 'ai_model', 'confirmed_by_admin', 'approved_by_admin_name', 'approved_by_admin_ip'].includes(k));
  const setClauses = allowedFields.map((field, i) => `${field}=$${i + 1}`).join(', ');
  const values = allowedFields.map(field => {
    if (['passport_issue_date', 'passport_expiry_date', 'dob', 'residence_expiry'].includes(field)) {
      return normalizeDate(fields[field]);
    }
    return fields[field];
  });
  values.push(reference_number);

  try {
      await pool.query(`UPDATE personal_info SET ${setClauses} WHERE reference_number=$${allowedFields.length + 1}`, values);
      logActivity(`DB_UPDATE personal_info ${reference_number}`);
      res.json({ success: true });
  } catch (e) {
      logError(`UPDATE_PERSONAL_INFO_ERROR ${e.message}`);
      res.status(500).json({ error: 'server_error' });
  }
});

app.post('/api/update-address-info', isAuthenticated, async (req, res) => {
  const { reference_number, ...fields } = req.body;
  if (!reference_number) return res.status(400).json({ error: 'missing_reference_number' });

  for (const key in fields) {
    if (typeof fields[key] === 'string') {
        fields[key] = sanitize(fields[key]);
    }
  }

  const allowedFields = Object.keys(fields).filter(k => !['id', 'personal_id', 'national_id', 'reference_number', 'confirmed_by_admin'].includes(k));
  const setClauses = allowedFields.map((field, i) => `${field}=$${i + 1}`).join(', ');
  const values = allowedFields.map(field => fields[field]);
  values.push(reference_number);
  
  try {
      await pool.query(`UPDATE address_info SET ${setClauses} WHERE reference_number=$${allowedFields.length + 1}`, values);
      logActivity(`DB_UPDATE address_info ${reference_number}`);
      res.json({ success: true });
  } catch (e) {
      logError(`UPDATE_ADDRESS_INFO_ERROR ${e.message}`);
      res.status(500).json({ error: 'server_error' });
  }
});

app.post('/api/update-work-info', isAuthenticated, async (req, res) => {
  const { reference_number, ...fields } = req.body;
  if (!reference_number) return res.status(400).json({ error: 'missing_reference_number' });

  for (const key in fields) {
    if (typeof fields[key] === 'string') {
        fields[key] = sanitize(fields[key]);
    }
  }

  const allowedFields = Object.keys(fields).filter(k => !['id', 'personal_id', 'national_id', 'reference_number', 'confirmed_by_admin'].includes(k));
  const setClauses = allowedFields.map((field, i) => `${field}=$${i + 1}`).join(', ');
  const values = allowedFields.map(field => {
    if (field === 'work_start_date') {
      return normalizeDate(fields[field]);
    }
    return fields[field];
  });
  values.push(reference_number);

  try {
      await pool.query(`UPDATE work_income_info SET ${setClauses} WHERE reference_number=$${allowedFields.length + 1}`, values);
      logActivity(`DB_UPDATE work_info ${reference_number}`);
      res.json({ success: true });
  } catch (e) {
      logError(`UPDATE_WORK_INFO_ERROR ${e.message}`);
      res.status(500).json({ error: 'server_error' });
  }
});

app.post('/api/address-info', async (req, res) => {
  const { reference, nid, adminChange, ...fields } = req.body || {};
  if (!reference && !nid) return res.status(400).json({ error: 'missing_identifier' });

  for (const key in fields) {
    if (typeof fields[key] === 'string') {
        fields[key] = sanitize(fields[key]);
    }
  }
  try {
    let personal;
    if (reference) {
      personal = await pool.query('SELECT id FROM personal_info WHERE reference_number=$1', [reference]);
    } else {
      personal = await pool.query('SELECT id, reference_number FROM personal_info WHERE national_id=$1 ORDER BY created_at DESC LIMIT 1', [nid]);
    }
    if (personal.rows.length === 0) return res.status(404).json({ error: 'not_found' });
    const pid = personal.rows[0].id;
    const ref = reference || personal.rows[0].reference_number;
    await pool.query(
      'INSERT INTO address_info (personal_id, national_id, reference_number, country, city, area, residential_address) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (reference_number) DO UPDATE SET country=EXCLUDED.country, city=EXCLUDED.city, area=EXCLUDED.area, residential_address=EXCLUDED.residential_address',
      [pid, nid || null, ref, fields.country || null, fields.city || null, fields.area || null, fields.residentialAddress || null]
    );
    logActivity(`DB_SAVE address_info ${ref}`);
    res.json({ success: true });
  } catch (e) {
    logError(`ADDRESS_INFO_SAVE_ERROR ${e.message}`);
    res.status(500).json({ error: 'server_error' });
  }
});

app.get('/api/address-info', async (req, res) => {
  const { reference, nid } = req.query;
  if (!reference && !nid) return res.status(400).json({ error: 'missing_identifier' });
  try {
    let address;
    if (reference) {
      address = await pool.query(
        `SELECT a.* FROM address_info a JOIN personal_info p ON a.personal_id=p.id WHERE p.reference_number=$1 ORDER BY a.id DESC LIMIT 1`,
        [reference]
      );
    } else {
      address = await pool.query(
        `SELECT a.* FROM address_info a JOIN personal_info p ON a.personal_id=p.id WHERE p.national_id=$1 ORDER BY a.id DESC LIMIT 1`,
        [nid]
      );
    }
    res.json(address.rows[0] || null);
  } catch (e) {
    logError(`ADDRESS_INFO_GET_ERROR ${e.message}`);
    res.status(500).json({ error: 'server_error' });
  }
});

app.post('/api/work-info', async (req, res) => {
  const { reference, nid, adminChange, ...fields } = req.body || {};
  if (!reference && !nid) return res.status(400).json({ error: 'missing_identifier' });

  for (const key in fields) {
    if (typeof fields[key] === 'string') {
        fields[key] = sanitize(fields[key]);
    }
  }
  try {
    let personal;
    if (reference) {
      personal = await pool.query('SELECT id FROM personal_info WHERE reference_number=$1', [reference]);
    } else {
      personal = await pool.query('SELECT id, reference_number FROM personal_info WHERE national_id=$1 ORDER BY created_at DESC LIMIT 1', [nid]);
    }
    if (personal.rows.length === 0) return res.status(404).json({ error: 'not_found' });
    const pid = personal.rows[0].id;
    const ref = reference || personal.rows[0].reference_number;
    await pool.query(
      'INSERT INTO work_income_info (personal_id, national_id, reference_number, employment_status, job_title, employer, employer_address, employer_phone, source_of_income, monthly_income, work_sector, field_of_work, work_start_date, work_country, work_city) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) ON CONFLICT (reference_number) DO UPDATE SET employment_status=EXCLUDED.employment_status, job_title=EXCLUDED.job_title, employer=EXCLUDED.employer, employer_address=EXCLUDED.employer_address, employer_phone=EXCLUDED.employer_phone, source_of_income=EXCLUDED.source_of_income, monthly_income=EXCLUDED.monthly_income, work_sector=EXCLUDED.work_sector, field_of_work=EXCLUDED.field_of_work, work_start_date=EXCLUDED.work_start_date, work_country=EXCLUDED.work_country, work_city=EXCLUDED.work_city',
      [pid, nid || null, ref, fields.employmentStatus || null, fields.jobTitle || null, fields.employer || null, fields.employerAddress || null, fields.employerPhone || null, fields.sourceOfIncome || null, fields.monthlyIncome || null, fields.workSector || null, fields.fieldOfWork || null, normalizeDate(fields.workStartDate) || null, fields.workCountry || null, fields.workCity || null]
    );
    logActivity(`DB_SAVE work_info ${ref}`);
    res.json({ success: true });
  } catch (e) {
    logError(`WORK_INFO_SAVE_ERROR ${e.message}`);
    res.status(500).json({ error: 'server_error' });
  }
});


app.get('/api/work-info', async (req, res) => {
  const { reference, nid } = req.query;
  if (!reference && !nid) return res.status(400).json({ error: 'missing_identifier' });
  try {
    let work;
    if (reference) {
      work = await pool.query(
        `SELECT w.* FROM work_income_info w
         JOIN personal_info p ON w.personal_id = p.id
         WHERE p.reference_number=$1
         ORDER BY w.id DESC LIMIT 1`,
        [reference]
      );
    } else {
      work = await pool.query(
        `SELECT w.* FROM work_income_info w
         JOIN personal_info p ON w.personal_id = p.id
         WHERE p.national_id=$1
         ORDER BY w.id DESC LIMIT 1`,
        [nid]
      );
    }
    res.json(work.rows[0] || null);
  } catch (e) {
    logError(`WORK_INFO_GET_ERROR ${e.message}`);
    res.status(500).json({ error: 'server_error' });
  }
});

app.get('/api/personal-info', async (req, res) => {
  const { reference, nid } = req.query;
  if (!reference && !nid) return res.status(400).json({ error: 'missing_identifier' });
  try {
    let personal;
    if (reference) {
      personal = await pool.query('SELECT * FROM personal_info WHERE reference_number=$1', [reference]);
    } else {
      personal = await pool.query('SELECT * FROM personal_info WHERE national_id=$1 ORDER BY created_at DESC LIMIT 1', [nid]);
    }
    if (personal.rows.length === 0) return res.status(404).json({ error: 'not_found' });
    res.json(personal.rows[0]);
  } catch (e) {
    logError(`PERSONAL_INFO_GET_ERROR ${e.message}`);
    res.status(500).json({ error: 'server_error' });
  }
});

function generateReference(createdAt) {
   const datePart = createdAt.toISOString().split('T')[0].replace(/-/g, '');
   const randomPart = crypto.randomBytes(5).toString('hex');
   return `REF-${datePart}-${randomPart}`;
}

function addWorkingDays(date, days) {
  const d = new Date(date);
  while (days > 0) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day >= 0 && day <= 4) days--; // Sunday to Thursday
  }
  return d;
}

async function scheduleAppointment(branchId, referenceNumber) {
  let slot = addWorkingDays(new Date(), 3);
  slot.setHours(9, 0, 0, 0);

  while (true) {
    const existing = await pool.query(
      'SELECT 1 FROM customer_queue WHERE branch=$1 AND appointment_time=$2',
      [branchId, slot]
    );
    if (existing.rows.length === 0) break;
    slot = new Date(slot.getTime() + 30 * 60 * 1000);
    if (slot.getHours() >= 14) {
      slot = addWorkingDays(slot, 1);
      slot.setHours(9, 0, 0, 0);
    }
  }

  await pool.query(
    'INSERT INTO customer_queue (branch, reference_number, appointment_time) VALUES ($1,$2,$3)',
    [branchId, referenceNumber, slot]
  );
  return slot;
}

function formatDate(d) {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatTime(d) {
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

app.post('/api/initialize-application', async (req, res) => {
    const { aiModel, serviceType } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO personal_info (full_name, ai_model, service_type) VALUES ($1, $2, $3) RETURNING id, created_at",
            ['temp name', aiModel || null, serviceType || null]
        );
        const { id, created_at } = result.rows[0];
        const referenceNumber = generateReference(created_at);
        await pool.query('UPDATE personal_info SET reference_number=$1 WHERE id=$2', [referenceNumber, id]);

        logActivity(`DB_INIT personal_info ${referenceNumber}`);
        res.json({ referenceNumber, createdAt: created_at });
    } catch (e) {
        logError(`INIT_APP_ERROR ${e.message}`);
        res.status(500).json({ error: 'Failed to initialize application' });
    }
});


app.post('/api/submit-form', async (req, res) => {
    try {
        const form = req.body || {};

        for (const key in form) {
            if (typeof form[key] === 'string') {
                form[key] = sanitize(form[key]);
            }
        }

        const manualFields = Array.isArray(form.manualFields) ? form.manualFields : [];
        const nid = Array.isArray(form.nidDigits) ? form.nidDigits.join('') : null;
        const referenceNumber = form.referenceNumber;

        if (!referenceNumber) {
            return res.status(400).json({ error: 'Missing reference number' });
        }

        const fullArabicName = [form.firstNameAr, form.middleNameAr, form.lastNameAr, form.surnameAr]
          .filter(Boolean)
          .join(' ');
        const values = [
            fullArabicName || form.fullName,
            form.firstNameEn || null,
            form.middleNameEn || null,
            form.lastNameEn || null,
            form.firstNameAr || null,
            form.middleNameAr || null,
            form.lastNameAr || null,
            form.surnameAr || null,
            form.surnameEn || null,
            form.motherFullName || null,
            form.maritalStatus || null,
            form.passportNumber || null,
            normalizeDate(form.passportIssueDate) || null,
            normalizeDate(form.passportExpiryDate) || null,
            form.birthPlace || null,
            normalizeDate(form.dob) || null,
            form.gender || null,
            form.nationality || null,
            form.familyRecordNumber || null,
            nid,
            form.phone || null,
            form.email || null,
            normalizeDate(form.residenceExpiry) || null,
            form.censusCardNumber || null,
            form.aiModel || null,
            form.serviceType || null,
            manualFields,
            form.branchId || null,
            referenceNumber,
            form.language || 'ar'
        ];
        const query = `UPDATE personal_info SET
      full_name=COALESCE($1, full_name),
      first_name=COALESCE($2, first_name),
      middle_name=COALESCE($3, middle_name),
      last_name=COALESCE($4, last_name),
      first_name_ar=COALESCE($5, first_name_ar),
      middle_name_ar=COALESCE($6, middle_name_ar),
      last_name_ar=COALESCE($7, last_name_ar),
      surname_ar=COALESCE($8, surname_ar),
      surname_en=COALESCE($9, surname_en),
      mother_full_name=COALESCE($10, mother_full_name),
      marital_status=COALESCE($11, marital_status),
      passport_number=COALESCE($12, passport_number),
      passport_issue_date=COALESCE($13, passport_issue_date),
      passport_expiry_date=COALESCE($14, passport_expiry_date),
      birth_place=COALESCE($15, birth_place),
      dob=COALESCE($16, dob),
      gender=COALESCE($17, gender),
      nationality=COALESCE($18, nationality),
      family_record_number=COALESCE($19, family_record_number),
      national_id=COALESCE($20, national_id),
      phone=COALESCE($21, phone),
      email=COALESCE($22, email),
      residence_expiry=COALESCE($23, residence_expiry),
      census_card_number=COALESCE($24, census_card_number),
      ai_model=COALESCE($25, ai_model),
      service_type=COALESCE($26, service_type),
      manual_fields=COALESCE($27, manual_fields),
      branch_id=COALESCE($28, branch_id),
      language=COALESCE($30, language)
    WHERE reference_number=$29 RETURNING id, created_at`;

        const result = await pool.query(query, values);
        const id = result.rows[0].id;
        const createdAt = result.rows[0].created_at;

        logActivity(`DB_UPDATE personal_info ${referenceNumber}`);

        if (form.addressInfo) {
            const a = form.addressInfo;
            await pool.query(
                'INSERT INTO address_info (personal_id, national_id, reference_number, country, city, area, residential_address) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (reference_number) DO UPDATE SET country=EXCLUDED.country, city=EXCLUDED.city, area=EXCLUDED.area, residential_address=EXCLUDED.residential_address',
                [id, nid, referenceNumber, a.country || null, a.city || null, a.area || null, a.residentialAddress || null]
            );
        }

        if (form.workInfo) {
            const w = form.workInfo;
            await pool.query(
                'INSERT INTO work_income_info (personal_id, national_id, reference_number, employment_status, job_title, employer, employer_address, employer_phone, source_of_income, monthly_income, work_sector, field_of_work, work_start_date, work_country, work_city) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) ON CONFLICT (reference_number) DO UPDATE SET employment_status=EXCLUDED.employment_status, job_title=EXCLUDED.job_title, employer=EXCLUDED.employer, employer_address=EXCLUDED.employer_address, employer_phone=EXCLUDED.employer_phone, source_of_income=EXCLUDED.source_of_income, monthly_income=EXCLUDED.monthly_income, work_sector=EXCLUDED.work_sector, field_of_work=EXCLUDED.field_of_work, work_start_date=EXCLUDED.work_start_date, work_country=EXCLUDED.work_country, work_city=EXCLUDED.work_city',
                [id, nid, referenceNumber, w.employmentStatus || null, w.jobTitle || null, w.employer || null, w.employerAddress || null, w.employerPhone || null, w.sourceOfIncome || null, w.monthlyIncome || null, w.workSector || null, w.fieldOfWork || null, normalizeDate(w.workStartDate) || null, w.workCountry || null, w.workCity || null]
            );
        }

        const userDir = path.join(userDocsBase, referenceNumber);
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }

        const uploads = cachedUploads[req.sessionId] || {};
        for (const [docType, fileName] of Object.entries(uploads)) {
            const newPath = path.join(userDir, path.basename(fileName));
            try {
                fs.renameSync(fileName, newPath);
            } catch (err) {
                logError(`MOVE_FILE_ERROR ${err.message}`);
            }
            await pool.query(
                'INSERT INTO uploaded_documents (personal_id, national_id, doc_type, file_name, reference_number) VALUES ($1,$2,$3,$4,$5)',
                [id, nid, docType, newPath, referenceNumber]
            );
        }
        delete cachedForm[req.sessionId];
        delete cachedUploads[req.sessionId];
        delete cachedExtracted[req.sessionId];
        const branchId = form.branchId || 101;
        const appointmentTime = await scheduleAppointment(branchId, referenceNumber);
        let branchEn = 'Main Branch';
        let branchAr = 'الفرع الرئيسي';
        try {
            const bres = await pool.query('SELECT name_en, name_ar FROM bank_branches WHERE branch_id=$1', [branchId]);
            if (bres.rows[0]) {
                branchEn = bres.rows[0].name_en;
                branchAr = bres.rows[0].name_ar;
            }
        } catch(e) { logError(`BRANCH_LOOKUP_ERROR ${e.message}`); }

        const arabicDays = ['\u0627\u0644\u0623\u062d\u062f','\u0627\u0644\u0627\u062b\u0646\u064a\u0646','\u0627\u0644\u062b\u0644\u0627\u062b\u0627\u0621','\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621','\u0627\u0644\u062e\u0645\u064a\u0633','\u0627\u0644\u062c\u0645\u0639\u0629','\u0627\u0644\u0633\u0628\u062a'];
        const englishDays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        const apptDate = new Date(appointmentTime);
        const dayAr = arabicDays[apptDate.getDay()];
        const dayEn = englishDays[apptDate.getDay()];
        const dateStr = formatDate(apptDate);
        const timeStr = formatTime(apptDate);

        let arabicMsg = `\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064a\u0643\u0645 \u0623. ${form.firstNameAr || form.fullName}\n\u0645\u0648\u0639\u062f\u0643\u0645 \u0641\u064a \u0641\u0631\u0639 ${branchAr} \u0628\u0645\u0635\u0631\u0641 \u0627\u0644\u0636\u0645\u0627\u0646 \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064a\n\u064a\u0648\u0645 ${dayAr} \u0627\u0644\u0645\u0648\u0627\u0641\u0642 ${dateStr} \u0627\u0644\u0633\u0627\u0639\u0629 ${timeStr}\n\u0644\u0625\u0643\u0645\u0627\u0644 \u0641\u062a\u062d \u062d\u0633\u0627\u0628\u0643\u0645\n\u0645\u0631\u062c\u0639: ${referenceNumber}\n\u0644\u0644\u0627\u0633\u062a\u0641\u0633\u0627\u0631: 0919875555\n\u0646\u062a\u0637\u0644\u0639 \u0644\u0627\u0633\u062a\u0642\u0628\u0627\u0644\u0643\u0645!`;
        let englishMsg = `Dear ${form.firstNameEn || form.fullName},\nYour appointment at ${branchEn} branch of Daman Islamic Bank is on ${dayEn} ${dateStr} at ${timeStr} to complete opening your account.\nReference: ${referenceNumber}\nFor inquiries: 0919875555\nWe look forward to welcoming you!`;
        const tplSms = await getTemplate('appointment', 'sms');
        if (tplSms) {
            arabicMsg = fillTemplate(tplSms.arabic_template, { name: form.firstNameAr || form.fullName, branch: branchAr, day_ar: dayAr, day_en: dayEn, date: dateStr, time: timeStr, reference: referenceNumber });
        }
        const tplEmail = await getTemplate('appointment', 'email');
        if (tplEmail) {
            englishMsg = fillTemplate(tplEmail.english_template, { name: form.firstNameEn || form.fullName, branch: branchEn, day_ar: dayAr, day_en: dayEn, date: dateStr, time: timeStr, reference: referenceNumber });
        }

        if (form.language === 'en') {
            if (form.phone) sendGenericSms(form.phone, englishMsg);
            if (form.email) await sendGenericEmail(form.email, 'Account Opening Appointment', englishMsg);
        } else {
            if (form.phone) sendGenericSms(form.phone, arabicMsg);
            if (form.email) await sendGenericEmail(form.email, 'Account Opening Appointment', arabicMsg);
        }

        res.json({ referenceNumber, createdAt, appointmentTime });
    } catch (e) {
        logError(`SUBMIT_ERROR ${e.message}; STACK: ${e.stack}`);
        res.status(500).json({ error: 'Failed to save' });
    }
});

app.post('/api/chatgpt', async (req, res) => {
  const { prompt, base64Data, mimeType } = req.body || {};
  try {
    const data = await callChatGPT(prompt, base64Data, mimeType);
    logActivity(`CHATGPT_RESPONSE ${JSON.stringify(data)}`);
    res.json(data);
  } catch (e) {
    logError(`CHATGPT_ERROR ${e.message}`);
    const status = e.message === 'Missing API key' ? 400 : 500;
    res.status(status).json({ error: e.message });
  }
});

app.post('/api/gemini', async (req, res) => {
  try {
    const data = await callGemini(req.body || {});
    logActivity(`GEMINI_RESPONSE ${JSON.stringify(data)}`);
    res.json(data);
  } catch (e) {
    logError(`GEMINI_ERROR ${e.message}`);
    const status = e.message === 'Missing API key' ? 400 : 500;
    res.status(status).json({ error: e.message });
  }
});

app.get('/api/test-db', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ connected: true });
  } catch (e) {
    logError(`DB_TEST_ERROR ${e.message} ${e.stack}`);
    res.status(500).json({ connected: false, error: e.message });
  }
});


app.get('/api/customers-no-bank', async (req, res) => {
  const { nid, customerId } = req.query;
  try {
    const params = [];
    let where = 'ba.id IS NULL';
    if (nid) {
      params.push(nid);
      where += ` AND p.national_id=$${params.length}`;
    }
    if (customerId) {
      params.push(customerId);
      where += ` AND cd.customer_id=$${params.length}`;
    }
    const result = await pool.query(
      `SELECT p.id, p.full_name, p.national_id, cd.customer_id
       FROM personal_info p
       LEFT JOIN customer_details cd ON cd.personal_info_id=p.id
       LEFT JOIN bank_accounts ba ON ba.personal_info_id=p.id
       WHERE ${where}
       ORDER BY p.created_at DESC`,
      params
    );
    res.json(result.rows);
  } catch (e) {
    logError(`NO_BANK_ACCOUNTS_ERROR ${e.message}`);
    res.status(500).json({ error: 'server_error' });
  }
});

app.get('/api/customer', async (req, res) => {
  const { reference, nid } = req.query;
  if (!reference && !nid) {
    return res.status(400).json({ error: 'missing_identifier' });
  }
  try {
    let personal;
    if (reference) {
      personal = await pool.query('SELECT * FROM personal_info WHERE reference_number=$1', [reference]);
    } else {
      personal = await pool.query('SELECT * FROM personal_info WHERE national_id=$1 ORDER BY created_at DESC LIMIT 1', [nid]);
    }
    if (personal.rows.length === 0) return res.status(404).json({ error: 'not_found' });
    const p = personal.rows[0];
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
    res.json({
      personalInfo: { ...p, branch_name: branchName, city_code: cityCode, city_name: cityName },
      addressInfo: address.rows[0] || null,
      workInfo: work.rows[0] || null,
      uploadedDocuments: docs.rows
    });
  } catch (e) {
    logError(`GET_CUSTOMER_ERROR ${e.message}`);
    res.status(500).json({ error: 'server_error' });
  }
});

app.post('/api/branch-date', async (req, res) => {
  const { branch } = req.body || {};
  if (!branch) return res.status(400).json({ error: 'missing_branch' });
  try {
    const url = process.env.BRANCH_DATE_API_URL;
    const token = process.env.BRANCH_DATE_API_TOKEN;
    logActivity(`BRANCH_DATE_POST ${url}`);
    logActivity(`BRANCH_DATE_PAYLOAD ${JSON.stringify({ branch })}`);
    const resp = await axios.post(url, { branch }, { headers: { Authorization: `Bearer ${token}` } });
    logActivity(`BRANCH_DATE_RESPONSE ${resp.status} ${JSON.stringify(resp.data)}`);
    res.json(resp.data);
  } catch (e) {
    logError(`BRANCH_DATE_ERROR ${e.message}`);
    res.status(500).json({ error: 'server_error' });
  }
});

app.post('/api/create-bank-account', async (req, res) => {
  const { personalId, ...payload } = req.body || {};
  if (!personalId) return res.status(400).json({ error: 'missing_personal_id' });
  try {
    const url = process.env.BANK_ACC_API_URL;
    const token = process.env.BANK_ACC_API_TOKEN;
    logActivity(`BANK_ACC_POST ${url}`);
    logActivity(`BANK_ACC_PAYLOAD ${JSON.stringify(payload)}`);
    const resp = await axios.post(url, payload, { headers: { Authorization: `Bearer ${token}` } });
    logActivity(`BANK_ACC_RESPONSE ${resp.status}`);
    const xml = resp.data;
    let parsed;
    try {
      parsed = await xml2js.parseStringPromise(xml, { explicitArray: false });
    } catch (err) {
      parsed = null;
    }
    const body = parsed?.['S:Envelope']?.['S:Body']?.['CREATEIACUSTACC_FSFS_RES'];
    const status = body?.FCUBS_HEADER?.MSGSTAT || '';
    const accountNumber = body?.FCUBS_BODY?.['Cust-Account-Full']?.ACC || null;
    await pool.query(
      'INSERT INTO bank_accounts (personal_info_id, customer_id, request_data, response_data, account_number, status) VALUES ($1,$2,$3,$4,$5,$6)',
      [personalId, payload.accId || null, payload, parsed, accountNumber, status]
    );
    res.json({ success: status === 'SUCCESS', accountNumber, data: body });
  } catch (e) {
    let parsed;
    if (e.response?.data) {
      try {
        parsed = await xml2js.parseStringPromise(e.response.data, { explicitArray: false });
      } catch {}
    }
    await pool.query(
      'INSERT INTO bank_accounts (personal_info_id, customer_id, request_data, response_data, status) VALUES ($1,$2,$3,$4,$5)',
      [personalId, payload.accId || null, payload, parsed, 'FAILURE']
    );
    const errMsg = parsed?.['S:Envelope']?.['S:Body']?.['CREATEIACUSTACC_FSFS_RES']?.FCUBS_ERROR_RESP?.ERROR?.EDESC || 'server_error';
    logError(`CREATE_BANK_ACC_ERROR ${e.message}`);
    res.status(500).json({ error: errMsg });
  }
});

// Fetch all applications with related data

// Update an uploaded document with a new file

// Approve or unapprove an uploaded document

// Update personal info approval status

// List all uploaded document references awaiting admin approval
app.get('/api/pending-docs', async (req, res) => {
  try {
    const result = await pool.query('SELECT reference_number FROM uploaded_documents WHERE confirmed_by_admin=FALSE ORDER BY created_at DESC');
    res.json(result.rows.map(r => r.reference_number));
  } catch (e) {
    logError(`PENDING_DOCS_ERROR ${e.message}`);
    res.status(500).json({ error: 'server_error' });
  }
});

// Add a new uploaded document for an existing customer

// Update selected service type for an existing customer
app.post('/api/service-type', async (req, res) => {
  const { reference, nid, serviceType } = req.body || {};
  if (!serviceType || (!reference && !nid)) {
    return res.status(400).json({ error: 'missing_parameters' });
  }
  try {
    let personal;
    if (reference) {
      personal = await pool.query('SELECT id FROM personal_info WHERE reference_number=$1', [reference]);
    } else {
      personal = await pool.query('SELECT id FROM personal_info WHERE national_id=$1 ORDER BY created_at DESC LIMIT 1', [nid]);
    }
    if (personal.rows.length === 0) return res.status(404).json({ error: 'not_found' });
    const pid = personal.rows[0].id;
    await pool.query('UPDATE personal_info SET service_type=$1 WHERE id=$2', [serviceType, pid]);
    logActivity(`SERVICE_TYPE_UPDATE ${pid}`);
    res.json({ success: true });
  } catch (e) {
    logError(`SERVICE_TYPE_ERROR ${e.message}`);
    res.status(500).json({ error: 'server_error' });
  }
});

// Approve or reject address information
app.post('/api/address-validation', async (req, res) => {
  const { reference, nid, approved, adminName } = req.body || {};
  if (!reference && !nid) return res.status(400).json({ error: 'missing_identifier' });
  try {
    let personal;
    if (reference) {
      personal = await pool.query('SELECT id FROM personal_info WHERE reference_number=$1', [reference]);
    } else {
      personal = await pool.query('SELECT id FROM personal_info WHERE national_id=$1 ORDER BY created_at DESC LIMIT 1', [nid]);
    }
    if (personal.rows.length === 0) return res.status(404).json({ error: 'not_found' });
    const pid = personal.rows[0].id;
    const adminIp = (req.headers['x-forwarded-for'] || req.ip || '').split(',')[0];
    await pool.query('UPDATE address_info SET confirmed_by_admin=$1 WHERE personal_id=$2', [approved, pid]);
    logActivity(`ADDRESS_VALIDATE ${pid} ${approved} ${adminName || ''} ${adminIp}`);
    res.json({ success: true });
  } catch (e) {
    logError(`ADDRESS_VALIDATE_ERROR ${e.message}`);
    res.status(500).json({ error: 'server_error' });
  }
});

// Approve or reject work and income information
app.post('/api/work-validation', async (req, res) => {
  const { reference, nid, approved, adminName } = req.body || {};
  if (!reference && !nid) return res.status(400).json({ error: 'missing_identifier' });
  try {
    let personal;
    if (reference) {
      personal = await pool.query('SELECT id FROM personal_info WHERE reference_number=$1', [reference]);
    } else {
      personal = await pool.query('SELECT id FROM personal_info WHERE national_id=$1 ORDER BY created_at DESC LIMIT 1', [nid]);
    }
    if (personal.rows.length === 0) return res.status(404).json({ error: 'not_found' });
    const pid = personal.rows[0].id;
    const adminIp = (req.headers['x-forwarded-for'] || req.ip || '').split(',')[0];
    await pool.query('UPDATE work_income_info SET confirmed_by_admin=$1 WHERE personal_id=$2', [approved, pid]);
    logActivity(`WORK_VALIDATE ${pid} ${approved} ${adminName || ''} ${adminIp}`);
    res.json({ success: true });
  } catch (e) {
    logError(`WORK_VALIDATE_ERROR ${e.message}`);
    res.status(500).json({ error: 'server_error' });
  }
});

app.use((err, req, res, next) => {
  logError(`ERROR ${err.message}`);
  res.status(500).json({ error: 'Server error' });
});

// Serve React App
app.use(express.static(path.join(__dirname, '..', 'build')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'build', 'index.html'));
});

// const HTTPS_PORT = process.env.HTTPS_PORT || 7102;

// try {
//   const sslOptions = {
//     key: fs.readFileSync(path.join(__dirname, '..', 'src', 'ssl', 'key.pem')),
//     cert: fs.readFileSync(path.join(__dirname, '..', 'src', 'ssl', 'cert.pem')),
//   };
//   https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
//     console.log(`HTTPS server running on port ${HTTPS_PORT}`);
//   });
// } catch (e) {
//   logError(`SSL_ERROR ${e.message}`);
//   console.error('Could not start HTTPS server.', e.message);
//   // Fallback to HTTP if SSL fails
//   http.createServer(app).listen(HTTP_PORT, () => {
//     console.log(`HTTP server running on port ${HTTP_PORT}`);
//   });
// }

http.createServer(app).listen(HTTP_PORT, () => {
  console.log(`HTTP server running on port ${HTTP_PORT}`);
});
