
const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  addFriend,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Private routes
router.get('/profile', protect, getUserProfile);
router.post('/friends', protect, addFriend);

module.exports = router;
