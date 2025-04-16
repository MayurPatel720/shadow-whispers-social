const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const { generateToken } = require('../utils/jwtHelper');
const postModel = require('../models/postModel');

// Track referrals in memory for this demo
// In production, this would be stored in the database
const referralCounts = {};

// @desc    Process referral
// @route   POST /api/users/process-referral
// @access  Public
const processReferral = asyncHandler(async (req, res) => {
  const { referralCode, referredUserId } = req.body;
  
  if (!referralCode) {
    res.status(400);
    throw new Error('Referral code is required');
  }

  try {
    // Find the user with this referral code
    // In this implementation, we generate a stable code based on user ID
    const users = await User.find({});
    const referrer = users.find(user => {
      // Same algorithm as in frontend to generate stable referral code
      const generateStableCode = (input) => {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
          const char = input.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        return Math.abs(hash).toString(36).substring(0, 6).toUpperCase().padEnd(6, '0');
      };
      
      const userCode = generateStableCode(user._id.toString());
      return userCode === referralCode.toUpperCase();
    });

    if (!referrer) {
      res.status(404);
      throw new Error('Invalid referral code');
    }

    // Increment referral count for this user
    const referrerId = referrer._id.toString();
    if (!referralCounts[referrerId]) {
      referralCounts[referrerId] = 0;
    }
    referralCounts[referrerId] += 1;

    res.status(200).json({ 
      success: true,
      message: 'Referral processed successfully' 
    });
  } catch (error) {
    res.status(500);
    throw new Error('Error processing referral: ' + error.message);
  }
});

// @desc    Get referral leaderboard
// @route   GET /api/users/referral-leaderboard
// @access  Public
const getReferralLeaderboard = asyncHandler(async (req, res) => {
  try {
    // Get all users
    const users = await User.find({}, 'anonymousAlias avatarEmoji');
    
    // Create leaderboard entries from user data with their referral counts
    const leaderboardEntries = users.map(user => {
      const userId = user._id.toString();
      return {
        userId: userId,
        anonymousAlias: user.anonymousAlias,
        avatarEmoji: user.avatarEmoji,
        referralsCount: referralCounts[userId] || 0
      };
    });
    
    // Sort by referral count descending
    const sortedEntries = leaderboardEntries
      .sort((a, b) => b.referralsCount - a.referralsCount)
      .map((entry, index) => ({
        ...entry,
        position: index + 1
      }));
    
    res.status(200).json(sortedEntries.slice(0, 10));
  } catch (error) {
    res.status(500);
    throw new Error('Error fetching leaderboard: ' + error.message);
  }
});

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
  const { username, fullName, email, password } = req.body;

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

  // Generate anonymous alias
  const anonymousAlias = user.generateAnonymousAlias();
  await user.save();

  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      anonymousAlias: user.anonymousAlias,
      avatarEmoji: user.avatarEmoji,
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

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  addFriend,
  getOwnPosts,
  processReferral,
  getReferralLeaderboard
};
