const fs = require('fs').promises;
const path = require('path');

// Ensure file exists
const ensureFileExists = async (filePath) => {
  try {
    await fs.access(filePath);
  } catch (error) {
    // File doesn't exist, create with empty object
    await fs.writeFile(filePath, JSON.stringify({}, null, 2));
  }
};

exports.saveUserProfileToFile = async (userData) => {
  try {
    const filePath = path.join(__dirname, '..', 'GenAI','interests.json');
    
    // Ensure the file exists
    await ensureFileExists(filePath);
    
    // Format the data to match the expected structure
    const formattedData = {
      success: true,
      message: "User profile retrieved",
      data: {
        user: {
          preferences: userData.preferences || {},
          // Include other relevant user data
          _id: userData._id,
          name: userData.name,
          email: userData.email,
          profilePicture: userData.profilePicture,
          xp: userData.xp
        }
      }
    };
    
    await fs.writeFile(filePath, JSON.stringify(formattedData, null, 2));
    console.log('User profile saved to interests.json successfully');
    return true;
  } catch (error) {
    console.error('Error saving user profile to file:', error);
    return false;
  }
};