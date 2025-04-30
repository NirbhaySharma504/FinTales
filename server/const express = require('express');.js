const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { FinancialNovelGenerator } = require('/GenAI/NovelGenerator');
const { QuizGenerator } = require('/GenAI/QuizGenerator');
const { Summarize } = require('/GenAI/Summarizer');

const app = express();
const port = 5000;

// Cache storage
const storyCache = new Map();
const quizCache = new Map();
const summaryCache = new Map();

// Initialize generators
const generator = new FinancialNovelGenerator();
const quizGenerator = new QuizGenerator();
const summarizer = new Summarize();

// Middleware
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000”,
  credentials: true
}));

// Generate story route
app.post('/api/generate', async (req, res) => {
  try {
    console.log("Loading user preferences...");
    await generator.loadUserData();

    console.log("Generating story from user preferences...");
    const story = await generator.generateStorySegment();
    console.log("Story generated successfully");

    // Generate quiz
    const quiz = await quizGenerator.generateQuiz(story.toJSON(), generator.gameState.difficulty);
    console.log("Quiz generated successfully");

    // Generate summary
    const summary = await summarizer.generateSummary(
      story.toJSON(),
      generator.gameState.selectedInterest
    );
    console.log("Summary generated successfully");

    // Cache everything
    const storyId = uuidv4();
    storyCache.set(storyId, story.toJSON());
    quizCache.set(storyId, quiz.toJSON());
    summaryCache.set(storyId, summary);

   // console.log("Story cached with ID: ${storyId});
    //console.log(Quiz and summary cached with ID: ${storyId});

    res.json({
      success: true,
      storyId,
      story: story.toJSON(),
      quiz: quiz.toJSON(),
      summary
    });

  } catch (error) {
    console.error("Full error traceback:", error);
    res.status(500).json({
      success: false,
      error: Story generation failed: ${error.message}
    });
  }
});

// Get story by ID route
app.get('/api/story/:storyId', (req, res) => {
  const { storyId } = req.params;
  
  if (storyCache.has(storyId)) {
    res.json({
      success: true,
      story: storyCache.get(storyId),
      quiz: quizCache.get(storyId),
      summary: summaryCache.get(storyId)
    });
  } else {
    res.status(404).json({
      success: false,
      error: "Story not found"
    });
  }
});

// Get latest story route
app.get('/api/latest-story', (req, res) => {
  const stories = Array.from(storyCache.keys());
  
  if (stories.length === 0) {
    res.status(404).json({
      success: false,
      error: "No stories available"
    });
    return;
  }

  const latestId = stories[stories.length - 1];
  res.json({
    success: true,
    story: storyCache.get(latestId),
    quiz: quizCache.get(latestId),
    summary: summaryCache.get(latestId)
  });
});

app.listen(port, () => {
  console.log(Server running at http://localhost:${port});
});