
// routes/userRoutes.js
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
  claimReward,
  verifyPayment,
  getReferralLeaderboard,
  recognizeUser,
  getRecognitions,
  revokeRecognition
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/process-referral', processReferral);
router.get('/referral-leaderboard', getReferralLeaderboard);

router.post('/claim-reward', protect, claimReward);
router.get('/userposts/:userId', protect, getOwnPosts);
router.get('/profile', protect, getUserProfile);
router.post('/verify-payment', protect, verifyPayment);
router.put('/profile', protect, updateUserProfile);
router.post('/friends', protect, addFriend);

// New recognition routes
router.post('/recognize', protect, recognizeUser);
router.get('/recognitions', protect, getRecognitions);
router.post('/revoke-recognition', protect, revokeRecognition);

module.exports = router;
