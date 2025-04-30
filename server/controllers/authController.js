const User = require('../models/userModel');
const admin = require('../config/firebase-config');
const { saveUserProfileToFile } = require('../utils/saveUserProfile');
// Change this import to use errorHandler instead of apiResponse
const { successResponse, errorResponse } = require('../utils/errorHandler');

// Verify Firebase token and create/update user in MongoDB
exports.authenticateUser = async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return errorResponse(res, 'ID token is required', 400);
    }
    
    // Verify the Firebase token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture, firebase } = decodedToken;
    
    // Check if this is a Google sign-in
    if (!firebase?.sign_in_provider || firebase.sign_in_provider !== 'google.com') {
      return errorResponse(res, 'Only Google sign-in is supported', 400);
    }
    
    // Find or create user in MongoDB
    let user = await User.findOne({ firebaseUid: uid });
    
    if (!user) {
      // Create new user with structured interests
      user = await User.create({
        firebaseUid: uid,
        email,
        name,
        profilePicture: picture || 'https://www.shutterstock.com/image-vector/user-account-profile-circle-flat-600nw-467503004.jpg',
        xp: 0,
        preferences: {
          interests: {
            'Music Artists': [],
            'Movies/Series': [],
            'Comics & Anime': [],
            'Art Style': [],
            'Spending Habits': [],
            'Hobbies/Activities': []
          },
          difficulty: 'beginner',
          notifications: true
        },
        completedLessons: [],
        ownedNFTs: []
      });
    } else {
      // Update user details from Google (they might have changed)
      user.email = email;
      user.name = name || user.name;
      if (picture) user.profilePicture = picture;
      await user.save();
    }
    
    return successResponse(res, 'Google authentication successful', { user });
  } catch (error) {
    console.error('Auth error:', error);
    return errorResponse(res, error.message, 401);
  }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    console.log('Getting user profile for ID:', req.user.id);
    
    const user = await User.findById(req.user.id)
      .select('-__v');
      
    // Only populate if these fields exist in your schema
    if (user) {
      if (user.ownedNFTs) {
        await user.populate('ownedNFTs');
      }
      await saveUserProfileToFile(user.toObject());
    }
      
    if (!user) {
      console.log('User not found for ID:', req.user.id);
      return errorResponse(res, 'User not found', 404);
    }
    
    console.log('User found, returning profile');
    return successResponse(res, 'User profile retrieved', { user });
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return errorResponse(res, error.message || 'Internal server error', 500);
  }
};

// Update user preferences
exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { interests } = req.body;
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Completely replace the interests object (don't merge)
    user.preferences = { 
      ...user.preferences,
      interests: interests // This will replace the entire interests object
    };
    
    // Save to interests.json file for GenAI use
    await saveUserProfileToFile(user.toObject());
    
    // Save to database
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get completed lessons for current user
exports.getCompletedLessons = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    
    // Return the completed lessons array
    return successResponse(res, 'Completed lessons retrieved successfully', { 
      completedLessons: user.completedLessons 
    });
  } catch (error) {
    console.error('Error retrieving completed lessons:', error);
    return errorResponse(res, error.message || 'Internal server error', 500);
  }
};

// Add a lesson to completed lessons array
exports.addCompletedLesson = async (req, res) => {
  try {
    const { lessonId } = req.body;
    
    if (!lessonId) {
      return errorResponse(res, 'Lesson ID is required', 400);
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    
    // Check if lesson is already in the completed lessons array
    if (!user.completedLessons.includes(lessonId)) {
      user.completedLessons.push(lessonId);
      
      // You might want to also update user XP here based on lesson completion
      // user.xp += lessonXpReward;
      user.xp += 50;
      await user.save();
    }
    
    return successResponse(res, 'Lesson marked as completed successfully', { 
      completedLessons: user.completedLessons
    });
  } catch (error) {
    console.error('Error adding completed lesson:', error);
    return errorResponse(res, error.message || 'Internal server error', 500);
  }
};

// Add XP to user
exports.addUserXP = async (req, res) => {
  try {
    const userId = req.user.id;
    const { xpAmount } = req.body;
    
    if (!xpAmount || typeof xpAmount !== 'number') {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid XP amount required' 
      });
    }
    
    // Find user and update XP
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Add the XP to current value
    user.xp = (user.xp || 0) + xpAmount;
    await user.save();
    
    // Update the interests.json file for GenAI
    const { saveUserProfileToFile } = require('../utils/saveUserProfile');
    await saveUserProfileToFile(user.toObject());
    
    res.status(200).json({
      success: true,
      message: `Successfully added ${xpAmount} XP`,
      data: { user }
    });
    
  } catch (error) {
    console.error('Error adding XP:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};