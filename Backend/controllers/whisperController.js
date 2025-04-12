
const asyncHandler = require('express-async-handler');
const Whisper = require('../models/whisperModel');
const User = require('../models/userModel');

// @desc    Send a new whisper message
// @route   POST /api/whispers
// @access  Private
const sendWhisper = asyncHandler(async (req, res) => {
  const { receiverId, content } = req.body;

  if (!receiverId || !content) {
    res.status(400);
    throw new Error('Please provide receiver and message content');
  }

  // Check if receiver exists
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    res.status(404);
    throw new Error('Receiver not found');
  }

  // Create the whisper
  const whisper = await Whisper.create({
    sender: req.user._id,
    receiver: receiverId,
    content,
    senderAlias: req.user.anonymousAlias,
    senderEmoji: req.user.avatarEmoji,
  });

  res.status(201).json(whisper);
});

// @desc    Get all whispers for current user (sent and received)
// @route   GET /api/whispers
// @access  Private
const getMyWhispers = asyncHandler(async (req, res) => {
  // Get all conversations where user is either sender or receiver
  // Group by conversation partner
  const conversations = await Whisper.aggregate([
    {
      $match: {
        $or: [
          { sender: req.user._id },
          { receiver: req.user._id }
        ]
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ["$sender", req.user._id] },
            "$receiver",
            "$sender"
          ]
        },
        lastMessage: { $first: "$$ROOT" },
        messages: { $push: "$$ROOT" }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    {
      $project: {
        _id: 1,
        lastMessage: 1,
        unreadCount: {
          $size: {
            $filter: {
              input: "$messages",
              as: "msg",
              cond: { 
                $and: [
                  { $eq: ["$$msg.receiver", req.user._id] },
                  { $eq: ["$$msg.read", false] }
                ]
              }
            }
          }
        },
        partner: {
          _id: { $arrayElemAt: ["$userDetails._id", 0] },
          anonymousAlias: { $arrayElemAt: ["$userDetails.anonymousAlias", 0] },
          avatarEmoji: { $arrayElemAt: ["$userDetails.avatarEmoji", 0] },
          // Only include username if user has recognized this person
          username: {
            $cond: {
              if: {
                $in: [
                  { $arrayElemAt: ["$userDetails._id", 0] },
                  req.user.recognizedUsers.map(ru => ru.userId)
                ]
              },
              then: { $arrayElemAt: ["$userDetails.username", 0] },
              else: null
            }
          }
        }
      }
    },
    {
      $sort: { "lastMessage.createdAt": -1 }
    }
  ]);

  res.json(conversations);
});

// @desc    Get whisper conversation with specific user
// @route   GET /api/whispers/:userId
// @access  Private
const getWhisperConversation = asyncHandler(async (req, res) => {
  const partnerId = req.params.userId;

  // Verify partner exists
  const partnerExists = await User.findById(partnerId);
  if (!partnerExists) {
    res.status(404);
    throw new Error('User not found');
  }

  // Get all messages between these two users
  const messages = await Whisper.find({
    $or: [
      { sender: req.user._id, receiver: partnerId },
      { sender: partnerId, receiver: req.user._id }
    ]
  }).sort({ createdAt: 1 });

  // Mark all unread messages as read
  await Whisper.updateMany(
    { sender: partnerId, receiver: req.user._id, read: false },
    { read: true }
  );

  // Check if user has recognized partner
  const hasRecognized = req.user.recognizedUsers.some(
    ru => ru.userId.toString() === partnerId
  );

  let partnerInfo = {
    _id: partnerExists._id,
    anonymousAlias: partnerExists.anonymousAlias,
    avatarEmoji: partnerExists.avatarEmoji
  };

  if (hasRecognized) {
    partnerInfo.username = partnerExists.username;
  }

  res.json({
    messages,
    partner: partnerInfo,
    hasRecognized
  });
});

module.exports = {
  sendWhisper,
  getMyWhispers,
  getWhisperConversation
};
