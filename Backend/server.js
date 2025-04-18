// Backend/server.js
require('dotenv').config({ path: './.env' }); // Load .env first

const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const ConnectTODB = require('./configs/dbConnect');
const indexRoutes = require('./routes/indexRoutes');
const userRoutes = require('./routes/userRoutes');
const ghostCircleRoutes = require('./routes/ghostCircleRoutes');
const postRoutes = require('./routes/postRoutes');
const whisperRoutes = require('./routes/whisperRoutes');


// Middleware
app.use(cors({
  origin: [
    'https://shadow-whispers-social.lovable.app',
    'http://localhost:8080',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

// Connect to DB
ConnectTODB();

// Routes
app.use('/api', indexRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ghost-circles', ghostCircleRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/whispers', whisperRoutes);

app.get('/healthcheck', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));