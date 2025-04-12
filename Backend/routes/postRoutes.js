
const express = require('express');
const router = express.Router();
const {
  createPost,
  getGlobalFeed,
  getGhostCirclePosts,
  likePost,
  recognizeUser,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

// Protected routes
router.post('/', protect, createPost);
router.get('/global', protect, getGlobalFeed);
router.get('/circle/:id', protect, getGhostCirclePosts);
router.put('/:id/like', protect, likePost);
router.post('/:id/recognize', protect, recognizeUser);

module.exports = router;
