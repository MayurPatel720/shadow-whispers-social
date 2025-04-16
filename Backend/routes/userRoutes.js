
const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  addFriend,
  getOwnPosts,
  processReferral,
  getReferralLeaderboard
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/process-referral', processReferral);
router.get('/referral-leaderboard', getReferralLeaderboard);

// Private routes
router.get('/userposts/:userId', protect, getOwnPosts);

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/friends', protect, addFriend);

module.exports = router;
