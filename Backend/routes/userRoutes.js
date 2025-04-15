
const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  addFriend,
  getOwnPosts,
  recognizeUser,
  leaveCompliment,
  revokeRecognition,
  challengeUser,
  getRecognitionStats
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Private routes
router.get('/userposts/:userId', protect, getOwnPosts);

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/friends', protect, addFriend);

// Recognition system routes
router.post('/recognize', protect, recognizeUser);
router.post('/compliment', protect, leaveCompliment);
router.post('/revoke-recognition', protect, revokeRecognition);
router.post('/challenge', protect, challengeUser);
router.get('/recognition-stats', protect, getRecognitionStats);

module.exports = router;
