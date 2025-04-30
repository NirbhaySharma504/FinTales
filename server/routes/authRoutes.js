const express = require('express');
const router = express.Router();
const { 
  authenticateUser, 
  getCurrentUser, 
  updatePreferences,
  getCompletedLessons,
  addCompletedLesson,
  addUserXP
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public route - Google sign-in only
router.post('/login', authenticateUser);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.put('/preferences', protect, updatePreferences);
router.get('/completed-lessons', protect, getCompletedLessons);
router.post('/complete-lesson', protect, addCompletedLesson);
router.post('/add-xp', protect, addUserXP);

module.exports = router; 