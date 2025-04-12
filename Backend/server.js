
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./configs/dbConnect');
const indexRoutes = require('./routes/indexRoutes');
const userRoutes = require('./routes/userRoutes');
const ghostCircleRoutes = require('./routes/ghostCircleRoutes');
const postRoutes = require('./routes/postRoutes');
const whisperRoutes = require('./routes/whisperRoutes');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express
const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? [
    'https://shadow-whispers-social.lovable.app/',  
    'http://localhost:3000'  
  ] : '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api', indexRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ghost-circles', ghostCircleRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/whispers', whisperRoutes);

// Health check endpoint for Render
app.get('/healthcheck', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handler middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
