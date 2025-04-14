
const asyncHandler = require('express-async-handler');
const GhostCircle = require('../models/ghostCircleModel');
const User = require('../models/userModel');

// @desc    Create a new ghost circle
// @route   POST /api/ghost-circles
// @access  Private
const createGhostCircle = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Please provide a name for the ghost circle');
  }

  const ghostCircle = await GhostCircle.create({
    name,
    description: description || '',
    creator: req.user._id,
    members: [{ userId: req.user._id, joinedAt: new Date() }]
  });

  // Add ghost circle to user's ghostCircles array
  await User.findByIdAndUpdate(
    req.user._id,
    { $push: { ghostCircles: ghostCircle._id } }
  );

  res.status(201).json(ghostCircle);
});

// @desc    Get all ghost circles for current user
// @route   GET /api/ghost-circles
// @access  Private
const getMyGhostCircles = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('ghostCircles');
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  res.json(user.ghostCircles);
});

// @desc    Invite a user to a ghost circle
// @route   POST /api/ghost-circles/:id/invite
// @access  Private
const inviteToGhostCircle = asyncHandler(async (req, res) => {
  const { friendUsername } = req.body;
  
  if (!friendUsername) {
    res.status(400);
    throw new Error('Please provide a friend username');
  }
  
  // Find the circle
  const ghostCircle = await GhostCircle.findById(req.params.id);
  
  if (!ghostCircle) {
    res.status(404);
    throw new Error('Ghost circle not found');
  }
  
  // Check if user is creator or admin
  if (ghostCircle.creator.toString() !== req.user._id.toString() && 
      !ghostCircle.admins.includes(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to invite to this circle');
  }
  
  // Find the friend to invite
  const friend = await User.findOne({ username: friendUsername });
  
  if (!friend) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Check if already a member
  const isMember = ghostCircle.members.some(member => 
    member.userId.toString() === friend._id.toString()
  );
  
  if (isMember) {
    res.status(400);
    throw new Error('User is already a member of this ghost circle');
  }
  
  // Add friend to ghost circle
  ghostCircle.members.push({ userId: friend._id, joinedAt: new Date() });
  await ghostCircle.save();
  
  // Add ghost circle to friend's ghostCircles array
  await User.findByIdAndUpdate(
    friend._id,
    { $push: { ghostCircles: ghostCircle._id } }
  );
  
  res.status(200).json({ message: 'User invited to ghost circle successfully' });
});

// @desc    Get a specific ghost circle by ID
// @route   GET /api/ghost-circles/:id
// @access  Private
const getGhostCircleById = asyncHandler(async (req, res) => {
  const ghostCircle = await GhostCircle.findById(req.params.id);
  
  if (!ghostCircle) {
    res.status(404);
    throw new Error('Ghost circle not found');
  }
  
  // Check if user is a member
  const isMember = ghostCircle.members.some(member => 
    member.userId.toString() === req.user._id.toString()
  );
  
  if (!isMember) {
    res.status(403);
    throw new Error('Not authorized to view this ghost circle');
  }
  
  res.json(ghostCircle);
});

module.exports = {
  createGhostCircle,
  getMyGhostCircles,
  inviteToGhostCircle,
  getGhostCircleById,
};
