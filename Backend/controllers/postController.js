
const asyncHandler = require('express-async-handler');
const Post = require('../models/postModel');
const User = require('../models/userModel');
const GhostCircle = require('../models/ghostCircleModel');

// @desc    Create a new post (global or in ghost circle)
// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
  const { content, ghostCircleId, imageUrl, expiresIn } = req.body;

  if (!content && !imageUrl) {
    res.status(400);
    throw new Error('Please add content or image to your post');
  }

  // Calculate expiry time (default 24 hours)
  const expiryTime = new Date();
  expiryTime.setHours(expiryTime.getHours() + (expiresIn || 24));

  const postData = {
    user: req.user._id,
    content: content || '',
    imageUrl: imageUrl || '',
    anonymousAlias: req.user.anonymousAlias,
    avatarEmoji: req.user.avatarEmoji,
    expiresAt: expiryTime,
  };

  if (ghostCircleId) {
    // Check if ghost circle exists and user is a member
    const ghostCircle = await GhostCircle.findById(ghostCircleId);
    
    if (!ghostCircle) {
      res.status(404);
      throw new Error('Ghost circle not found');
    }
    
    const isMember = ghostCircle.members.some(member => 
      member.userId.toString() === req.user._id.toString()
    );
    
    if (!isMember) {
      res.status(403);
      throw new Error('Not authorized to post in this ghost circle');
    }
    
    postData.ghostCircle = ghostCircleId;
  }

  const post = await Post.create(postData);

  // If posting to a ghost circle, add post to the circle's posts
  if (ghostCircleId) {
    await GhostCircle.findByIdAndUpdate(
      ghostCircleId,
      { $push: { posts: post._id } }
    );
  }

  res.status(201).json(post);
});

// @desc    Get global feed posts (not in ghost circles)
// @route   GET /api/posts/global
// @access  Private
const getGlobalFeed = asyncHandler(async (req, res) => {
  const posts = await Post.find({
    ghostCircle: { $exists: false },
    expiresAt: { $gt: new Date() },
  })
    .sort({ createdAt: -1 })
    .limit(30);
  
  res.json(posts);
});

// @desc    Get ghost circle posts
// @route   GET /api/posts/circle/:id
// @access  Private
const getGhostCirclePosts = asyncHandler(async (req, res) => {
  // Check if user is member of the ghost circle
  const ghostCircle = await GhostCircle.findById(req.params.id);
  
  if (!ghostCircle) {
    res.status(404);
    throw new Error('Ghost circle not found');
  }
  
  const isMember = ghostCircle.members.some(member => 
    member.userId.toString() === req.user._id.toString()
  );
  
  if (!isMember) {
    res.status(403);
    throw new Error('Not authorized to view posts in this ghost circle');
  }
  
  const posts = await Post.find({
    ghostCircle: req.params.id,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });
  
  res.json(posts);
});

// @desc    Like/unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
const likePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  
  // Check if post has already been liked by user
  const alreadyLiked = post.likes.some(like => 
    like.user.toString() === req.user._id.toString()
  );
  
  if (alreadyLiked) {
    // Remove like
    post.likes = post.likes.filter(like => 
      like.user.toString() !== req.user._id.toString()
    );
  } else {
    // Add like
    post.likes.push({ 
      user: req.user._id, 
      anonymousAlias: req.user.anonymousAlias 
    });
    
    // Extend post life by 1 hour
    if (post.expiresAt > new Date()) {
      post.expiresAt = new Date(post.expiresAt.getTime() + 60 * 60 * 1000);
    }
  }
  
  await post.save();
  
  res.json({ likes: post.likes.length, expiresAt: post.expiresAt });
});

// @desc    Try to recognize post author
// @route   POST /api/posts/:id/recognize
// @access  Private
const recognizeUser = asyncHandler(async (req, res) => {
  const { guessUsername } = req.body;
  
  if (!guessUsername) {
    res.status(400);
    throw new Error('Please provide a username guess');
  }
  
  const post = await Post.findById(req.params.id);
  
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  
  // Find the guessed user
  const guessedUser = await User.findOne({ username: guessUsername });
  
  if (!guessedUser) {
    return res.status(200).json({ 
      correct: false, 
      message: 'No user found with that username' 
    });
  }
  
  // Check if guess is correct
  const isCorrect = post.user.toString() === guessedUser._id.toString();
  
  if (isCorrect) {
    // Check if already recognized
    const alreadyRecognized = req.user.recognizedUsers.some(ru => 
      ru.userId.toString() === post.user.toString()
    );
    
    if (!alreadyRecognized) {
      // Add to recognized users
      await User.findByIdAndUpdate(
        req.user._id,
        { 
          $push: { 
            recognizedUsers: { 
              userId: post.user, 
              recognizedAt: new Date() 
            } 
          } 
        }
      );
      
      // Add to identity recognizers of the post author
      await User.findByIdAndUpdate(
        post.user,
        { 
          $push: { 
            identityRecognizers: { 
              userId: req.user._id, 
              recognizedAt: new Date() 
            } 
          } 
        }
      );
    }
    
    return res.json({ 
      correct: true, 
      message: 'Correct! You recognized the user.',
      user: {
        _id: guessedUser._id,
        username: guessedUser.username,
        avatarEmoji: guessedUser.avatarEmoji
      }
    });
  } else {
    return res.json({ 
      correct: false, 
      message: 'Incorrect guess. Try again!' 
    });
  }
});

module.exports = {
  createPost,
  getGlobalFeed,
  getGhostCirclePosts,
  likePost,
  recognizeUser,
};
