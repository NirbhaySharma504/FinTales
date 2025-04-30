import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { BookOpen, Plus } from "lucide-react"
import "./StoryLibrary.scss"

interface StoryInfo {
  story_id: string
  title: string
  concept: string
  timestamp: string
  cover?: string
}

export const StoryLibrary = () => {
  const [stories, setStories] = useState<StoryInfo[]>([])

  useEffect(() => {
    const mockStories: StoryInfo[] = [
      {
        story_id: "1",
        title: "Spider-Man's Emergency Fund",
        concept: "Emergency Funds",
        timestamp: new Date().toISOString(),
        cover: "/placeholder.svg",
      },
      {
        story_id: "2",
        title: "Captain America's Budget Plan",
        concept: "Budgeting",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        cover: "/placeholder.svg",
      },
      {
        story_id: "3",
        title: "Black Widow's Investment Strategy",
        concept: "Investing",
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        cover: "/placeholder.svg",
      },
    ]

    setStories(mockStories)
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="story-library">
      <div className="story-library__container">
        <div className="story-library__header">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Your Story Library
          </motion.h1>

          <Link to="/create">
            <button className="story-library__create-button">
              <Plus className="icon" /> Create New Story
            </button>
          </Link>
        </div>

        {stories.length === 0 ? (
          <div className="story-library__empty-state">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <BookOpen className="story-library__empty-state-icon" />
              <h2>No stories yet</h2>
              <p>Create your first visual novel to get started</p>

              <Link to="/create">
                <button className="story-library__create-button">
                  <Plus className="icon" /> Create Your First Story
                </button>
              </Link>
            </motion.div>
          </div>
        ) : (
          <motion.div
            className="story-library__grid"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {stories.map((story) => (
              <motion.div key={story.story_id} variants={item}>
                <Link to={`/story/${story.story_id}`}>
                  <div className="story-library__card">
                    <div className="story-library__card-image">
                      <img src={story.cover} alt={story.title} />
                      <div className="story-library__card-image-overlay" />
                      <div className="story-library__card-image-tag">
                        {story.concept}
                      </div>
                    </div>

                    <div className="story-library__card-content">
                      <h3>{story.title}</h3>
                      <p>
                        Created {new Date(story.timestamp).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="story-library__card-footer">
                      <button>Continue Reading</button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
