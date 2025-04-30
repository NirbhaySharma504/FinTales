const admin = require('../config/firebase-config');
const User = require('../models/userModel');
const { errorResponse } = require('../utils/errorHandler');

// Middleware to verify Firebase token and attach user to request
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return errorResponse(res, 'Not authorized, no token', 401);
    }
    
    // Verify token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Get user from Firebase UID
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user) {
      return errorResponse(res, 'User not found in database', 404);
    }
    
    // Attach user object to request
    req.user = {
      id: user._id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      name: user.name,
      role: user.role,
      preferences: user.preferences
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return errorResponse(res, 'Not authorized, token failed', 401);
  }
};

// Middleware to restrict access to admin roles
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return errorResponse(res, 'Not authorized as an admin', 403);
  }
};