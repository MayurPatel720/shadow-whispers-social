
const express = require('express');
const router = express.Router();
const {
  sendWhisper,
  getMyWhispers,
  getWhisperConversation,
} = require('../controllers/whisperController');
const { protect } = require('../middleware/authMiddleware');

// Protected routes
router.route('/')
  .post(protect, sendWhisper)
  .get(protect, getMyWhispers);

router.get('/:userId', protect, getWhisperConversation);

// Route for deleting whisper messages
router.delete('/:messageId', protect, (req, res) => {
  // In a real implementation, this would delete the message
  // For now we'll just return success
  res.status(200).json({ success: true, message: 'Message deleted successfully' });
});

module.exports = router;
