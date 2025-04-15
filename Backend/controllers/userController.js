const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const { generateToken } = require('../utils/jwtHelper');
const postModel = require('../models/postModel');
const Referral = require('../models/referralModel');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const getOwnPosts = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  const posts = await postModel.find({ user: userId })
    .sort({ createdAt: -1 }) // Sort posts by most recent first
    .populate('likes.user', 'username') // Populate likes with user information (optional)
    .populate('comments.user', 'username') // Populate comments with user information (optional)
    .exec();

  // Check if the user has any posts
  if (!posts || posts.length === 0) {
    res.status(404);
    throw new Error('No posts found for this user');
  }

  // Send the posts as the response
  res.status(200).json(posts);
});

const registerUser = asyncHandler(async (req, res) => {
  const { username, fullName, email, password, referralCode } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ $or: [{ email }, { username }] });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user with fullName
  const user = await User.create({
    username,
    fullName,
    email,
    password,
  });

  // Generate anonymous alias and referral code
  const anonymousAlias = user.generateAnonymousAlias();
  
  // Check if a referral code was provided
  if (referralCode) {
    // Find referrer by the provided code
    const referrer = await User.findOne({ referralCode });
    
    if (referrer) {
      // Set referred by
      user.referredBy = referrer._id;
      
      // Create referral record
      await Referral.create({
        referrer: referrer._id,
        referred: user._id,
        code: referralCode,
        status: 'pending'
      });
      
      // Update referrer count
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
  }
  
  // Save the user with all the updates
  await user.save();

  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      anonymousAlias: user.anonymousAlias,
      avatarEmoji: user.avatarEmoji,
      referralCode: user.referralCode,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      anonymousAlias: user.anonymousAlias,
      avatarEmoji: user.avatarEmoji,
      referralCode: user.referralCode,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      anonymousAlias: user.anonymousAlias,
      avatarEmoji: user.avatarEmoji,
      clues: user.clues,
      friends: user.friends,
      ghostCircles: user.ghostCircles,
      recognizedUsers: user.recognizedUsers,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (user) {
    // Update only allowed fields
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    
    // Save the updated user
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      anonymousAlias: updatedUser.anonymousAlias,
      avatarEmoji: updatedUser.avatarEmoji,
      bio: updatedUser.bio,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Add friend by code
// @route   POST /api/users/friends
// @access  Private
const addFriend = asyncHandler(async (req, res) => {
  const { friendUsername } = req.body;
  
  if (!friendUsername) {
    res.status(400);
    throw new Error('Please provide a friend username');
  }

  // Find the friend
  const friend = await User.findOne({ username: friendUsername });
  
  if (!friend) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Don't add yourself as friend
  if (friend._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot add yourself as a friend');
  }

  // Check if already friends
  const user = await User.findById(req.user._id);
  if (user.friends.includes(friend._id)) {
    res.status(400);
    throw new Error('You are already friends with this user');
  }

  // Add each other as friends
  user.friends.push(friend._id);
  await user.save();
  
  friend.friends.push(user._id);
  await friend.save();

  res.status(200).json({ message: 'Friend added successfully' });
});

// @desc    Recognize a user by username
// @route   POST /api/users/recognize
// @access  Private
const recognizeUser = asyncHandler(async (req, res) => {
  const { targetUsername } = req.body;
  
  // Find the target user
  const targetUser = await User.findOne({ username: targetUsername });
  
  if (!targetUser) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Don't allow self-recognition
  if (targetUser._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot recognize yourself');
  }
  
  // Check if already recognized
  const currentUser = await User.findById(req.user._id);
  const alreadyRecognized = currentUser.recognizedUsers.some(
    rec => rec.userId.toString() === targetUser._id.toString()
  );
  
  if (alreadyRecognized) {
    res.status(400);
    throw new Error('You have already recognized this user');
  }
  
  // Update recognition stats
  currentUser.recognitionStats.totalGuesses += 1;
  currentUser.recognitionStats.correctGuesses += 1;
  currentUser.recognitionStats.successRate = 
    (currentUser.recognitionStats.correctGuesses / currentUser.recognitionStats.totalGuesses) * 100;
  
  // Add to recognizedUsers
  currentUser.recognizedUsers.push({
    userId: targetUser._id,
    recognizedAt: Date.now()
  });
  
  await currentUser.save();
  
  // Add to the target's identityRecognizers
  targetUser.identityRecognizers.push({
    userId: currentUser._id,
    recognizedAt: Date.now()
  });
  
  // Update shadow reputation
  updateShadowReputation(targetUser);
  
  await targetUser.save();
  
  res.status(200).json({
    message: 'User recognized successfully',
    recognizedUser: {
      _id: targetUser._id,
      username: targetUser.username,
      anonymousAlias: targetUser.anonymousAlias,
      avatarEmoji: targetUser.avatarEmoji,
    }
  });
});

// @desc    Leave a compliment for a recognized user
// @route   POST /api/users/compliment
// @access  Private
const leaveCompliment = asyncHandler(async (req, res) => {
  const { targetUserId, complimentText } = req.body;
  
  // Validate compliment
  if (!complimentText || complimentText.trim() === '') {
    res.status(400);
    throw new Error('Compliment text is required');
  }
  
  // Find the current user
  const currentUser = await User.findById(req.user._id);
  
  // Check if user has recognized the target
  const recognitionIndex = currentUser.recognizedUsers.findIndex(
    rec => rec.userId.toString() === targetUserId
  );
  
  if (recognitionIndex === -1) {
    res.status(400);
    throw new Error('You must recognize a user before leaving a compliment');
  }
  
  // Add compliment to recognizedUsers
  currentUser.recognizedUsers[recognitionIndex].compliments.push({
    text: complimentText,
    createdAt: Date.now()
  });
  
  await currentUser.save();
  
  // Add compliment to the target's identityRecognizers
  const targetUser = await User.findById(targetUserId);
  
  if (!targetUser) {
    res.status(404);
    throw new Error('Target user not found');
  }
  
  const targetRecIndex = targetUser.identityRecognizers.findIndex(
    rec => rec.userId.toString() === req.user._id.toString()
  );
  
  if (targetRecIndex !== -1) {
    targetUser.identityRecognizers[targetRecIndex].compliments.push({
      text: complimentText,
      createdAt: Date.now()
    });
    
    await targetUser.save();
  }
  
  res.status(200).json({
    message: 'Compliment added successfully'
  });
});

// @desc    Revoke recognition of a user
// @route   POST /api/users/revoke-recognition
// @access  Private
const revokeRecognition = asyncHandler(async (req, res) => {
  const { targetUserId } = req.body;
  
  // Find the current user
  const currentUser = await User.findById(req.user._id);
  
  // Check if user has recognized the target
  const recognitionIndex = currentUser.recognizedUsers.findIndex(
    rec => rec.userId.toString() === targetUserId
  );
  
  if (recognitionIndex === -1) {
    res.status(400);
    throw new Error('You have not recognized this user');
  }
  
  // Check if revocation is allowed (once per week)
  const recognition = currentUser.recognizedUsers[recognitionIndex];
  const now = new Date();
  
  if (recognition.lastRevokedAt) {
    const cooldownEndDate = new Date(recognition.lastRevokedAt);
    cooldownEndDate.setDate(cooldownEndDate.getDate() + 7); // 7 days cooldown
    
    if (now < cooldownEndDate) {
      res.status(400);
      throw new Error('You can only revoke recognition once per week');
    }
  }
  
  // Set 30-day cooldown for re-recognition
  const canRecognizeAgainDate = new Date();
  canRecognizeAgainDate.setDate(canRecognizeAgainDate.getDate() + 30);
  
  recognition.lastRevokedAt = now;
  recognition.canRecognizeAgainAt = canRecognizeAgainDate;
  
  // Remove the recognition from the target user
  const targetUser = await User.findById(targetUserId);
  
  if (targetUser) {
    targetUser.identityRecognizers = targetUser.identityRecognizers.filter(
      rec => rec.userId.toString() !== req.user._id.toString()
    );
    
    // Update shadow reputation
    updateShadowReputation(targetUser);
    
    await targetUser.save();
  }
  
  await currentUser.save();
  
  // Update recognition stats
  currentUser.recognitionStats.correctGuesses -= 1;
  if (currentUser.recognitionStats.totalGuesses > 0) {
    currentUser.recognitionStats.successRate = 
      (currentUser.recognitionStats.correctGuesses / currentUser.recognitionStats.totalGuesses) * 100;
  } else {
    currentUser.recognitionStats.successRate = 0;
  }
  
  await currentUser.save();
  
  res.status(200).json({
    message: 'Recognition revoked successfully'
  });
});

// @desc    Challenge a user who has recognized you
// @route   POST /api/users/challenge
// @access  Private
const challengeUser = asyncHandler(async (req, res) => {
  const { targetUserId } = req.body;
  
  // Find the current user
  const currentUser = await User.findById(req.user._id);
  
  // Check if target has recognized the current user
  const recognizerIndex = currentUser.identityRecognizers.findIndex(
    rec => rec.userId.toString() === targetUserId
  );
  
  if (recognizerIndex === -1) {
    res.status(400);
    throw new Error('This user has not recognized you');
  }
  
  const recognizer = currentUser.identityRecognizers[recognizerIndex];
  
  if (!recognizer.isChallengeable) {
    res.status(400);
    throw new Error('You cannot challenge this user right now');
  }
  
  // Mark as challenged
  recognizer.isChallengeable = false;
  currentUser.recognitionStats.lastChallengeAt = Date.now();
  await currentUser.save();
  
  // Find the target user and update their status
  const targetUser = await User.findById(targetUserId);
  if (targetUser) {
    const targetRecIndex = targetUser.recognizedUsers.findIndex(
      rec => rec.userId.toString() === req.user._id.toString()
    );
    
    if (targetRecIndex !== -1) {
      // Reset recognition (soft reset - keep the record but allow re-recognition)
      const canRecognizeAgainDate = new Date();
      targetUser.recognizedUsers[targetRecIndex].lastRevokedAt = Date.now();
      targetUser.recognizedUsers[targetRecIndex].canRecognizeAgainAt = canRecognizeAgainDate;
      
      await targetUser.save();
    }
  }
  
  res.status(200).json({
    message: 'Challenge initiated successfully'
  });
});

// @desc    Get recognition statistics for the current user
// @route   GET /api/users/recognition-stats
// @access  Private
const getRecognitionStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('recognitionStats shadowReputation recognizedUsers identityRecognizers')
    .populate('recognizedUsers.userId', 'username anonymousAlias avatarEmoji')
    .populate('identityRecognizers.userId', 'username anonymousAlias avatarEmoji');
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Calculate mutual recognitions
  const recognizedIds = user.recognizedUsers.map(rec => rec.userId._id.toString());
  const recognizerIds = user.identityRecognizers.map(rec => rec.userId._id.toString());
  
  const mutualRecognitions = recognizedIds.filter(id => recognizerIds.includes(id));
  
  res.status(200).json({
    stats: {
      recognizedCount: user.recognizedUsers.length,
      recognizedByCount: user.identityRecognizers.length,
      mutualCount: mutualRecognitions.length,
      shadowReputation: user.shadowReputation,
      recognitionRate: user.recognitionStats.successRate,
      correctGuesses: user.recognitionStats.correctGuesses,
      totalGuesses: user.recognitionStats.totalGuesses,
    }
  });
});

// Helper function to update shadow reputation
const updateShadowReputation = (user) => {
  // Base reputation formula - can be adjusted as needed
  const recognizerCount = user.identityRecognizers.length;
  
  // Calculate reputation score (0-100 scale)
  // This is a simple formula that can be expanded with more factors
  let score = Math.min(recognizerCount * 5, 100);
  
  user.shadowReputation.score = score;
  
  // Add badges based on reputation
  if (score >= 20 && !user.shadowReputation.badges.some(b => b.name === 'Shadow Novice')) {
    user.shadowReputation.badges.push({
      name: 'Shadow Novice',
      unlockedAt: Date.now()
    });
  }
  
  if (score >= 50 && !user.shadowReputation.badges.some(b => b.name === 'Shadow Master')) {
    user.shadowReputation.badges.push({
      name: 'Shadow Master',
      unlockedAt: Date.now()
    });
  }
  
  if (score >= 75 && !user.shadowReputation.badges.some(b => b.name === 'Shadow Elite')) {
    user.shadowReputation.badges.push({
      name: 'Shadow Elite',
      unlockedAt: Date.now()
    });
  }
  
  if (score >= 100 && !user.shadowReputation.badges.some(b => b.name === 'Shadow Legend')) {
    user.shadowReputation.badges.push({
      name: 'Shadow Legend',
      unlockedAt: Date.now()
    });
  }
  
  return score;
};

module.exports = {
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
};
