
const express = require('express');
const router = express.Router();
const {
  createGhostCircle,
  getMyGhostCircles,
  inviteToGhostCircle,
  getGhostCircleById,
} = require('../controllers/ghostCircleController');
const { protect } = require('../middleware/authMiddleware');

// Protected routes
router.route('/')
  .post(protect, createGhostCircle)
  .get(protect, getMyGhostCircles);

router.route('/:id')
  .get(protect, getGhostCircleById);

router.route('/:id/invite')
  .post(protect, inviteToGhostCircle);

module.exports = router;
