
const express = require('express');
const router = express.Router();
const { 
  getReferralInfo, 
  applyReferralCode, 
  verifyReferral, 
  claimReward 
} = require('../controllers/referralController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/apply', applyReferralCode);

// Private routes
router.get('/info', protect, getReferralInfo);
router.put('/verify/:referralId', protect, verifyReferral);
router.post('/claim-reward', protect, claimReward);

module.exports = router;
