
const express = require('express');
const router = express.Router();
const {
  createPost,
  getGlobalFeed,
  getGhostCirclePosts,
  likePost,
  addComment,
  getComments,
  deletepost,
  recognizeUser,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

// Protected routes
router.post('/', protect, createPost);
router.delete('/delete/:postId', protect, deletepost);
router.get('/global', protect, getGlobalFeed);
router.get('/circle/:id', protect, getGhostCirclePosts);
router.put('/:id/like', protect, likePost);
router.post('/:id/recognize', protect, recognizeUser);
router.post('/:id/comments', protect, addComment);
router.get('/:id/comments', protect, getComments);

module.exports = router;
