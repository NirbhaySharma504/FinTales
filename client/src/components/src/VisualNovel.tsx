import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StoryScene } from './StoryScene'
import { DialogBox } from './DialogBox'
import { CharacterSprite } from './CharacterSprite'
import { Controls } from './controls'
import { Button } from './Components/button'
import { useNavigate, useParams } from 'react-router-dom'
import './Components/VisualNovel.scss'

const getBackgroundForScene = (backgrounds: Record<string, string>, sceneIndex: number) => {
  // Get all background URLs without filtering by key
  const availableBackgrounds = Object.values(backgrounds);
  
  if (availableBackgrounds.length === 0) {
    console.error("No backgrounds available");
    return "";
  }
  
  // Use modulo to cycle through all available backgrounds
  return availableBackgrounds[sceneIndex % availableBackgrounds.length];
}


interface StoryData {
  plot: {
    title: string
    setup: string
    location: string
  }
  dialogue: Array<{
    character: string
    text: string
    hint?: string
  }>
  visuals: {
    characters: Array<any>
    backgrounds: Array<any>
    financial_elements: string
  }
  generated_images: {
    cover: string
    characters: Record<string, string>
    backgrounds: Record<string, string>
  }
  hooks: {
    pop_culture: string
    music: string
  }
}

const LoadingSpinner = () => (
  <div className="visual-novel__loading">
    <motion.div
      className="visual-novel__spinner"
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    >
      <div className="visual-novel__spinner-ring" />
    </motion.div>
  </div>
)

const VisualNovel = () => {
  const [story, setStory] = useState<StoryData | null>(null)
  const [currentScene, setCurrentScene] = useState(0)
  const [showCover, setShowCover] = useState(true)
  const navigate = useNavigate()
  const { storyId } = useParams()

  useEffect(() => {
    // Check if we're in "generating" state from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const generatingState = urlParams.get('state') === 'generating';
    
    if (generatingState) {
      // Show loading UI and poll for latest story
      const checkInterval = setInterval(async () => {
        try {
          const response = await fetch('http://localhost:8000/api/latest-story')
          const data = await response.json()
          
          // Check if a new story is available
          if (data.story && data.story.dialogue) {
            setStory(data.story)
            clearInterval(checkInterval)
            
            // Update URL to remove the generating state
            window.history.replaceState({}, '', '/visual-novel')
          }
        } catch (error) {
          console.error('Error checking for new story:', error)
        }
      }, 3000); // Poll every 3 seconds
      
      // Clean up interval on component unmount
      return () => clearInterval(checkInterval);
    } else if (storyId) {
      fetchStory(storyId)
    } else {
      fetchLatestStory()
    }
  }, [storyId])

  const fetchStory = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/story/${id}`)
      const data = await response.json()
      setStory(data.story)
    } catch (error) {
      console.error('Error fetching story:', error)
    }
  }

  const fetchLatestStory = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/latest-story')
      const data = await response.json()
      setStory(data.story)
    } catch (error) {
      console.error('Error fetching story:', error)
    }
  }

  // When navigating to quiz, pass the storyId
  const handleFinishStory = () => {
    // Use the storyId from params, or if not available, use 'latest'
    const currentStoryId = storyId || 'latest'
    navigate(`/summary?storyId=${currentStoryId}`)
  }

  if (!story || !story.dialogue) {
    return (
      <div className="visual-novel__loading">
        <motion.div
          className="visual-novel__spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  if (showCover) {
    return (
      <div className="visual-novel__cover">
        <motion.div
          className="visual-novel__cover-wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <img
            src={story.generated_images.cover}
            alt="Story Cover"
            className="visual-novel__cover-image"
          />
          <div className="visual-novel__cover-gradient" />
          <div className="visual-novel__cover-content">
            <motion.h1
              className="visual-novel__title"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {story.plot.title}
            </motion.h1>
            <motion.p
              className="visual-novel__description"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {story.plot.setup}
            </motion.p>
            <motion.div
              className="visual-novel__start"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <Button onClick={() => setShowCover(false)}>
                Begin Your Journey
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="visual-novel">
      <AnimatePresence mode="sync">
        {story.dialogue[currentScene] && (
          <>
            <StoryScene
              key={`scene-${currentScene}`}
              background={getBackgroundForScene(story.generated_images.backgrounds, currentScene)}
              character={story.generated_images.characters[story.dialogue[currentScene].character]}
            />
            <DialogBox
              key={`dialog-${currentScene}`}
              dialogue={story.dialogue[currentScene]}
              onNext={() => {
                if (currentScene + 1 < story.dialogue.length) {
                  setCurrentScene(prev => prev + 1)
                } else {
                  handleFinishStory()
                }
              }}
            />
            <Controls
              key="controls"
              onSave={() => console.log('Save requested')}
              onLoad={() => console.log('Load requested')}
              title={story.plot.title}
              progress={`${currentScene + 1}/${story.dialogue.length}`}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default VisualNovel;
