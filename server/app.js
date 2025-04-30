const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const nftRoutes = require('./routes/nftRoutes');

// Set up FastAPI connection
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// Create caches using Map
const storyCache = new Map();
const quizCache = new Map();
const summaryCache = new Map();

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// Apply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/nfts', nftRoutes);

// API status route
app.get('/api/status', (req, res) => {
  res.json({
    status: 'success',
    message: 'CoinQuest API is running',
    version: '1.0.0',
    timestamp: new Date(),
    pythonApiUrl: PYTHON_API_URL
  });
});

// Root route - API documentation
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to CoinQuest API',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      nfts: '/api/nfts',
      python: {
        generate: '/api/generate',
        story: '/api/story/:storyId',
        latestStory: '/api/latest-story',
        allStories: '/api/all-stories',
        generateQuiz: '/api/generate-quiz',
        generateSummary: '/api/generate-summary'
      }
    }
  });
});

// Story generation with FastAPI
app.post('/api/generate', async (req, res) => {
  try {
    console.log("Forwarding story generation request to FastAPI...");
    
    // First, load user data
    await axios.post(`${PYTHON_API_URL}/api/load-user-data`);
    
    // Then generate the story
    const response = await axios.post(`${PYTHON_API_URL}/api/generate`, {
      difficulty: req.body.difficulty || 'beginner'
    });
    
    const { storyId, story, quiz, summary } = response.data;
    
    // Cache everything
    storyCache.set(storyId, story);
    quizCache.set(storyId, quiz);
    summaryCache.set(storyId, summary);
    
    console.log(`Story cached with ID: ${storyId}`);
    
    res.json(response.data);
  } catch (error) {
    console.error("Error generating story:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: `Story generation failed: ${error.response?.data?.detail || error.message}`
    });
  }
});

// Get story by ID
app.get('/api/story/:storyId', async (req, res) => {
  const { storyId } = req.params;
  
  // First check local cache
  if (storyCache.has(storyId)) {
    return res.json({
      success: true,
      story: storyCache.get(storyId),
      quiz: quizCache.get(storyId),
      summary: summaryCache.get(storyId)
    });
  }
  
  // If not in cache, try FastAPI server
  try {
    const response = await axios.get(`${PYTHON_API_URL}/api/story/${storyId}`);
    
    // Cache for future requests
    if (response.data.success) {
      storyCache.set(storyId, response.data.story);
      quizCache.set(storyId, response.data.quiz);
      summaryCache.set(storyId, response.data.summary);
    }
    
    return res.json(response.data);
  } catch (error) {
    // If 404 from FastAPI, it's definitely not found
    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        success: false,
        error: "Story not found"
      });
    }
    
    // For other errors, return 500
    console.error("Error fetching story:", error.message);
    return res.status(500).json({
      success: false,
      error: `Failed to fetch story: ${error.message}`
    });
  }
});

// Get latest story route
app.get('/api/latest-story', async (req, res) => {
  // First try from local cache
  const stories = Array.from(storyCache.keys());
  
  if (stories.length > 0) {
    const latestId = stories[stories.length - 1];
    return res.json({
      success: true,
      story: storyCache.get(latestId),
      quiz: quizCache.get(latestId),
      summary: summaryCache.get(latestId)
    });
  }
  
  // If no stories in cache, try FastAPI server
  try {
    const response = await axios.get(`${PYTHON_API_URL}/api/latest-story`);
    return res.json(response.data);
  } catch (error) {
    // If 404 from FastAPI, it means no stories available
    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        success: false,
        error: "No stories available"
      });
    }
    
    // For other errors, return 500
    console.error("Error fetching latest story:", error.message);
    return res.status(500).json({
      success: false,
      error: `Failed to fetch latest story: ${error.message}`
    });
  }
});

// Generate a quiz for a specific story
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { storyData, difficulty } = req.body;
    if (!storyData) {
      return res.status(400).json({
        success: false,
        error: "Story data is required"
      });
    }
    
    // Forward request to FastAPI server
    const response = await axios.post(`${PYTHON_API_URL}/api/generate-quiz`, {
      story_data: storyData,
      difficulty: difficulty || 'beginner'
    });
    
    res.json({
      success: true,
      quiz: response.data
    });
  } catch (error) {
    console.error("Error generating quiz:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: `Failed to generate quiz: ${error.response?.data?.detail || error.message}`
    });
  }
});

// Generate a summary for a specific story
app.post('/api/generate-summary', async (req, res) => {
  try {
    const { storyData, selectedInterest } = req.body;
    if (!storyData) {
      return res.status(400).json({
        success: false,
        error: "Story data is required"
      });
    }
    
    // Forward request to FastAPI server
    const response = await axios.post(`${PYTHON_API_URL}/api/generate-summary`, {
      story_data: storyData,
      selected_interest: selectedInterest
    });
    
    res.json({
      success: true,
      summary: response.data
    });
  } catch (error) {
    console.error("Error generating summary:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: `Failed to generate summary: ${error.response?.data?.detail || error.message}`
    });
  }
});

// List all available stories
app.get('/api/all-stories', async (req, res) => {
  try {
    // Forward request to FastAPI server
    const response = await axios.get(`${PYTHON_API_URL}/api/stories`);
    res.json(response.data);
  } catch (error) {
    console.error("Error listing stories:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: `Failed to list stories: ${error.response?.data?.detail || error.message}`
    });
  }
});

// Load user data explicitly
app.post('/api/load-user-data', async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_API_URL}/api/load-user-data`);
    res.json(response.data);
  } catch (error) {
    console.error("Error loading user data:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: `Failed to load user data: ${error.response?.data?.detail || error.message}`
    });
  }
});

// Check if the FastAPI server is running
app.get('/api/check-python-server', async (req, res) => {
  try {
    const response = await axios.get(PYTHON_API_URL, {
      timeout: 5000 // 5 second timeout
    });
    res.json({
      success: true,
      pythonServerStatus: 'running',
      pythonApiResponse: response.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      pythonServerStatus: 'not running',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Server error', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});
app.use(notFound);
app.use(errorHandler);

module.exports = app;