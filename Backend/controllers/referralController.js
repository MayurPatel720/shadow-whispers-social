
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Referral = require('../models/referralModel');
const { generateToken } = require('../utils/jwtHelper');

// @desc    Get current user's referral info
// @route   GET /api/referrals/info
// @access  Private
const getReferralInfo = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Count verified referrals
  const verifiedReferrals = await Referral.countDocuments({
    referrer: user._id,
    status: 'verified'
  });

  // Get top referrers (leaderboard data)
  const leaderboard = await User.aggregate([
    {
      $match: { referralCount: { $gt: 0 } }
    },
    {
      $sort: { referralCount: -1 }
    },
    {
      $limit: 10
    },
    {
      $project: {
        _id: 1,
        anonymousAlias: 1,
        avatarEmoji: 1,
        referralCount: 1
      }
    }
  ]);

  // Return all referral-related data
  res.json({
    referralCode: user.referralCode,
    referralCount: user.referralCount,
    referralRewards: user.referralRewards,
    leaderboard,
    verifiedReferrals
  });
});

// @desc    Apply a referral code during registration
// @route   POST /api/referrals/apply
// @access  Public
const applyReferralCode = asyncHandler(async (req, res) => {
  const { code, userId } = req.body;

  // Find referrer by code
  const referrer = await User.findOne({ referralCode: code });

  if (!referrer) {
    res.status(404);
    throw new Error('Invalid referral code');
  }

  // Make sure user isn't referring themselves
  if (referrer._id.toString() === userId) {
    res.status(400);
    throw new Error('You cannot refer yourself');
  }

  // Find the user who is being referred
  const referred = await User.findById(userId);

  if (!referred) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if user already used a referral code
  if (referred.referredBy) {
    res.status(400);
    throw new Error('User already has been referred');
  }

  // Create referral record
  const referral = await Referral.create({
    referrer: referrer._id,
    referred: referred._id,
    code: code,
    status: 'pending'
  });

  // Update referred user
  referred.referredBy = referrer._id;
  await referred.save();

  res.status(201).json({ 
    message: 'Referral code applied successfully', 
    referral 
  });
});

// @desc    Verify a referral (after user completes requirements)
// @route   PUT /api/referrals/verify/:referralId
// @access  Private
const verifyReferral = asyncHandler(async (req, res) => {
  const referral = await Referral.findById(req.params.referralId);

  if (!referral) {
    res.status(404);
    throw new Error('Referral not found');
  }

  // Update referral status
  referral.status = 'verified';
  referral.verifiedAt = Date.now();
  await referral.save();

  // Update referrer's count and check for rewards
  const referrer = await User.findById(referral.referrer);
  if (referrer) {
    // Increment referral count
    referrer.referralCount += 1;
    
    // Check for reward milestones and grant if needed
    const currentCount = referrer.referralCount;
    
    // Check for tier 1: 5 referrals = badge
    if (currentCount >= 5 && !referrer.referralRewards.some(r => r.type === 'badge')) {
      referrer.referralRewards.push({
        type: 'badge',
        name: 'Shadow Recruiter',
        claimed: true,
        claimedAt: Date.now()
      });
    }
    
    // Check for tier 2: 10 referrals = $100 cash
    if (currentCount >= 10 && !referrer.referralRewards.some(r => r.type === 'cash')) {
      referrer.referralRewards.push({
        type: 'cash',
        name: '$100 Cash Reward',
        claimed: false
      });
    }
    
    // Check for tier 3: 20 referrals = premium features
    if (currentCount >= 20 && !referrer.referralRewards.some(r => r.type === 'premium')) {
      referrer.referralRewards.push({
        type: 'premium',
        name: 'Premium Features',
        claimed: true,
        claimedAt: Date.now()
      });
    }
    
    await referrer.save();
  }

  res.json({ message: 'Referral verified successfully', referral });
});

// @desc    Claim a cash reward
// @route   POST /api/referrals/claim-reward
// @access  Private
const claimReward = asyncHandler(async (req, res) => {
  const { rewardIndex, paymentMethod, paymentEmail } = req.body;
  
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if reward exists and is unclaimed
  if (!user.referralRewards[rewardIndex] || 
      user.referralRewards[rewardIndex].claimed ||
      user.referralRewards[rewardIndex].type !== 'cash') {
    res.status(400);
    throw new Error('Invalid or already claimed reward');
  }

  // Update reward to claimed status
  user.referralRewards[rewardIndex].claimed = true;
  user.referralRewards[rewardIndex].claimedAt = Date.now();
  user.referralRewards[rewardIndex].paymentInfo = {
    method: paymentMethod,
    email: paymentEmail,
    status: 'processing'
  };

  await user.save();

  // Here you would integrate with payment service (PayPal, etc.)
  // For now just return success

  res.json({ 
    message: 'Reward claim submitted successfully', 
    reward: user.referralRewards[rewardIndex] 
  });
});

module.exports = {
  getReferralInfo,
  applyReferralCode,
  verifyReferral,
  claimReward
};
