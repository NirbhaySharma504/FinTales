const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const cloudinary = require('cloudinary').v2;
const Story = require('../models/storyModel');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Service to bridge between Node.js and Python story generator
 */
class PythonBridgeService {
  /**
   * Generate a story using the Python NovelGenerator
   * @param {Object} options - Options for story generation
   * @param {String} options.userId - User ID
   * @param {String} options.lessonId - Lesson ID
   * @param {Object} options.userPreferences - User preferences
   * @returns {Promise<Object>} Generated story data
   */
  async generateStory(options) {
    const { userId, lessonId, userPreferences } = options;
    
    try {
      // Check if story already exists for this user and lesson
      const existingStory = await Story.findOne({ userId, lessonId });
      if (existingStory) {
        // Story already exists, return it
        return existingStory;
      }
      
      // Story doesn't exist, generate a new one
      const storyData = await this._runPythonGenerator({
        userId,
        lessonId,
        userPreferences
      });
      
      // Upload images to Cloudinary
      const imageUrls = await this._uploadImagesToCloudinary(storyData);
      
      // Create and save story in the database
      const story = new Story({
        userId,
        lessonId,
        title: storyData.plot.title,
        content: JSON.stringify(storyData),
        imagePrompts: storyData.visuals?.characters?.map(c => c.description) || [],
        generatedImages: Object.values(imageUrls),
        userProgress: {
          currentChoiceIndex: 0,
          progress: 0,
          completed: false
        }
      });
      
      await story.save();
      return story;
    } catch (error) {
      console.error('Error in Python bridge service:', error);
      throw new Error(`Failed to generate story: ${error.message}`);
    }
  }
  
  /**
   * Run the Python generator script
   * @private
   * @param {Object} data - Data to pass to the Python script
   * @returns {Promise<Object>} Generated story data
   */
  _runPythonGenerator(data) {
    return new Promise((resolve, reject) => {
      // Create a temporary JSON file with the input data
      const inputFile = path.join(__dirname, '../temp', `input_${data.userId}_${Date.now()}.json`);
      const outputFile = path.join(__dirname, '../temp', `output_${data.userId}_${Date.now()}.json`);
      
      // Ensure temp directory exists
      const tempDir = path.join(__dirname, '../temp');
      
      // Use promise chain for file operations
      Promise.resolve()
        .then(() => {
          if (!fsSync.existsSync(tempDir)) {
            return fs.mkdir(tempDir, { recursive: true });
          }
          return Promise.resolve();
        })
        .then(() => {
          // Create input data file
          return fs.writeFile(inputFile, JSON.stringify({
            user_id: data.userId,
            lesson_id: data.lessonId,
            preferences: {
              interests: data.userPreferences?.interests || [],
              age: data.userPreferences?.age || 16,
              education_level: data.userPreferences?.educationLevel || 'high school'
            }
          }));
        })
        .then(() => {
          // Path to Python script
          const scriptPath = path.join(__dirname, '../py/generate_story.py');
          
          // Run Python script
          const pythonProcess = spawn('python3', [
            scriptPath,
            '--input', inputFile,
            '--output', outputFile
          ]);
          
          let stdoutData = '';
          let stderrData = '';
          
          pythonProcess.stdout.on('data', (data) => {
            stdoutData += data.toString();
          });
          
          pythonProcess.stderr.on('data', (data) => {
            stderrData += data.toString();
          });
          
          pythonProcess.on('close', async (code) => {
            try {
              // Clean up input file
              await fs.unlink(inputFile).catch(err => {
                console.warn(`Could not delete input file: ${err.message}`);
              });
              
              if (code !== 0) {
                console.error('Python process exited with code:', code);
                console.error('stderr:', stderrData);
                return reject(new Error(`Python process failed with code ${code}: ${stderrData}`));
              }
              
              try {
                // Read output file
                const fileContent = await fs.readFile(outputFile, 'utf8');
                const outputData = JSON.parse(fileContent);
                
                // Clean up output file
                await fs.unlink(outputFile).catch(err => {
                  console.warn(`Could not delete output file: ${err.message}`);
                });
                
                resolve(outputData);
              } catch (parseError) {
                reject(new Error(`Failed to parse Python output: ${parseError.message}`));
              }
            } catch (cleanupError) {
              reject(cleanupError);
            }
          });
          
          pythonProcess.on('error', (err) => {
            reject(new Error(`Failed to start Python process: ${err.message}`));
          });
        })
        .catch(err => {
          reject(new Error(`Error in Python bridge setup: ${err.message}`));
        });
    });
  }
  
  /**
   * Upload images to Cloudinary
   * @private
   * @param {Object} storyData - Generated story data
   * @returns {Promise<Object>} Object with URLs of uploaded images
   */
  async _uploadImagesToCloudinary(storyData) {
    const imageUrls = {};
    
    try {
      // Check if there are generated images in the story data
      if (storyData.generated_images) {
        // Upload cover image if exists
        if (storyData.generated_images.cover) {
          try {
            const coverPath = path.join(__dirname, '../py/output/images/', storyData.generated_images.cover);
            if (fsSync.existsSync(coverPath)) {
              const result = await cloudinary.uploader.upload(coverPath, {
                folder: 'coinquest/covers',
                public_id: `cover_${Date.now()}`
              });
              imageUrls.cover = result.secure_url;
            } else {
              console.warn(`Cover image not found at path: ${coverPath}`);
            }
          } catch (coverError) {
            console.error('Error uploading cover image:', coverError);
          }
        }
        
        // Upload character images
        if (storyData.generated_images.characters) {
          for (const [name, relativePath] of Object.entries(storyData.generated_images.characters)) {
            try {
              const imagePath = path.join(__dirname, '../py/output/images/', relativePath);
              if (fsSync.existsSync(imagePath)) {
                const result = await cloudinary.uploader.upload(imagePath, {
                  folder: 'coinquest/characters',
                  public_id: `character_${name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`
                });
                imageUrls[`character_${name}`] = result.secure_url;
              } else {
                console.warn(`Character image not found at path: ${imagePath}`);
              }
            } catch (charError) {
              console.error(`Error uploading character image for ${name}:`, charError);
            }
          }
        }
        
        // Upload background images
        if (storyData.generated_images.backgrounds) {
          for (const [name, relativePath] of Object.entries(storyData.generated_images.backgrounds)) {
            try {
              const imagePath = path.join(__dirname, '../py/output/images/', relativePath);
              if (fsSync.existsSync(imagePath)) {
                const result = await cloudinary.uploader.upload(imagePath, {
                  folder: 'coinquest/backgrounds',
                  public_id: `background_${name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`
                });
                imageUrls[`background_${name}`] = result.secure_url;
              } else {
                console.warn(`Background image not found at path: ${imagePath}`);
              }
            } catch (bgError) {
              console.error(`Error uploading background image for ${name}:`, bgError);
            }
          }
        }
      }
      
      return imageUrls;
    } catch (error) {
      console.error('Error uploading images to Cloudinary:', error);
      return imageUrls; // Return whatever we have so far
    }
  }
}

module.exports = new PythonBridgeService();