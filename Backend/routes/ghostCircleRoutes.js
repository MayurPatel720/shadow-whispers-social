
const express = require('express');
const router = express.Router();
const {
  createGhostCircle,
  getMyGhostCircles,
  inviteToGhostCircle,
} = require('../controllers/ghostCircleController');
const { protect } = require('../middleware/authMiddleware');

// Protected routes
router.route('/')
  .post(protect, createGhostCircle)
  .get(protect, getMyGhostCircles);

router.route('/:id/invite')
  .post(protect, inviteToGhostCircle);

module.exports = router;
