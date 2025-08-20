const fs = require('fs');
const path = require('path');
const { ActivityLog, ErrorLog } = require('../models');

const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

function logMessage(msg) {
  const file = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);
  const entry = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFile(file, entry, (err) => {
    if (err) console.error('Log error:', err);
  });
}

async function logActivity(msg) {
  logMessage(msg);
  try {
    await ActivityLog.create({ activity: msg });
  } catch (e) {
    console.error('Activity log error:', e.message);
  }
}

async function logError(msg) {
  logMessage(msg);
  try {
    await ErrorLog.create({ error: msg });
  } catch (e) {
    console.error('Error log error:', e.message);
  }
}

function logEmailDebug(msg) {
  const file = path.join(logsDir, 'email.log');
  const entry = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFile(file, entry, (err) => {
    if (err) console.error('Email log error:', err);
  });
}

module.exports = {
    logMessage,
    logActivity,
    logError,
    logEmailDebug
};
