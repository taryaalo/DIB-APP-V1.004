const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
// const RedisStore = require('connect-redis');
// const { createClient } = require('redis');
const { logActivity } = require('../utils/logger');
require('dotenv').config({ path: '../../.env' });


const app = express();

// // Initialize Redis client
// const redisClient = createClient({
//     host: process.env.REDIS_HOST || 'localhost',
//     port: process.env.REDIS_PORT || 6379
// });
// redisClient.connect().catch(console.error);

// // Initialize Redis store
// const redisStore = new RedisStore({
//     client: redisClient,
//     prefix: 'dib-app:',
// });


const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:7102',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes

app.use(express.json({ limit: '20mb' }));

// Session middleware
app.use(
    session({
        // store: redisStore,
        secret: process.env.SESSION_SECRET || 'a-very-strong-secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 // 24 hours
        }
    })
);


app.use((req, res, next) => {
  const ip = (req.headers['x-forwarded-for'] || req.ip || '').split(',')[0];
  logActivity(`REQUEST ${req.method} ${req.originalUrl} ${ip}`);
  next();
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
const userDocsBase = path.join(__dirname, '..', '..', 'src', 'user_document');
if (!fs.existsSync(userDocsBase)) {
  fs.mkdirSync(userDocsBase, { recursive: true });
}
app.use('/user_document', express.static(userDocsBase));

// API routes
app.use(require('../routes'));

module.exports = app;
