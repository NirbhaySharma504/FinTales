import React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "./Components/button"
import { ChevronDown, Trophy, Loader2, Sparkles } from "lucide-react"
import "./Components/StoryCreator.scss"

interface Topic {
  title: string
  subtopics: string[]
}

interface UserProfile {
  photoURL?: string
  name?: string
  xp?: number
}

// Add placeholder values at the top of the component


export const StoryCreator = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [openTopics, setOpenTopics] = useState<{[key: number]: boolean}>({})

  const [userProfile] = useState<UserProfile>({
    name: "Michael Clifford",
    photoURL: "/placeholder.svg?height=80&width=80",
    xp: 450
  })

  // Calculate XP here after userProfile state
  const xpTotal = 1000
  const xpCurrent = 15
  const xpPercentage = Math.min(100, Math.round((xpCurrent / xpTotal) * 100))



  const topics = [
    {
      title: "💸 Budgeting",
      subtopics: [
        "What is a Budget and Why It Matters",
        "Building Your First Simple Budget",
        "Budgeting Methods: 50/30/20 Rule and Zero-Based Budgeting",
        "Adjusting Your Budget for Emergencies and Unexpected Costs",
        "Tools for Smart Budgeting",
      ],
    },
    {
      title: "💰 Saving",
      subtopics: [
        "Why Save? Understanding Emergency Funds and Future Planning",
        "Setting Short-term, Medium-term, and Long-term Savings Goals",
        "Where to Save: Savings Accounts, Fixed Deposits, Recurring Deposits",
        "Starting Early: Time, Growth, and Compound Interest",
      ],
    },
    {
      title: "💳 Improving Credit",
      subtopics: [
        "What is Credit?",
        "Understanding Credit Scores",
        "Factors that Affect Your Credit Score",
        "How to Repair and Improve a Bad Credit Score",
        "Avoiding Debt Traps",
      ],
    },
    {
      title: "📈 Investing",
      subtopics: [
        "What is Investing",
        "Basics of Investment Options",
        "Understanding Risk vs Reward",
        "Magic of Compounding in Investments",
        "How to Start Investing Young (SIP, Robo-advisors, Stock Apps)",
      ],
    },
    {
      title: "🧾 Taxes",
      subtopics: [
        "Why Do We Pay Taxes?",
        "Basics of Income Tax",
        "How to File Income Tax Returns (ITR)",
        "GST and Everyday Spending",
        "Ways to Save on Taxes",
      ],
    },
    {
      title: "🏦 Borrowing and Repaying Debt",
      subtopics: [
        "Understanding Debt",
        "Good Debt vs Bad Debt (Student Loans, Credit Cards, Car Loans)",
        "How Interest Works",
        "How to Borrow Smartly (Terms to Check Before Taking Any Loan)",
      ],
    },
  ]

  const toggleTopic = (index: number) => {
    setOpenTopics((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const handleGenerateStory = async (topic: string, subtopic: string) => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          difficulty: "beginner",
          concept: {
            topic: topic.replace(/[^\w\s]/g, ''),
            subtopic: subtopic
          },
          characters: {
            protagonist: "Spider-Man",
            mentor: "Iron Man",
            friend: "MJ"
          }
        })
      })

      const data = await response.json()
      if (data.success) {
        navigate(`/story/${data.storyId}`)
      }
    } catch (error) {
      console.error("Error generating story:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="story-creator">
      <header className="story-creator__header">
        <div className="story-creator__header-logo">FinQuest</div>
      </header>

      <div className="story-creator__content">
        <div className="story-creator__user-box">
          <img
            src={userProfile?.photoURL || "/placeholder.svg?height=80&width=80"}
            alt="Profile"
            className="story-creator__user-box-avatar"
          />

          <div className="story-creator__user-box-info">
            <h2 className="story-creator__user-box-name">
              {userProfile?.name || "Michael Clifford"}
            </h2>
            <p className="story-creator__user-box-subtitle">Student Booster · 24Y</p>
            
            <div className="story-creator__user-box-stats">
              <div className="story-creator__user-box-stats-item">
                <strong>27</strong> Stories Completed
              </div>
              <div className="story-creator__user-box-stats-item">
                <strong>27min</strong> Total Time
              </div>
              <div className="story-creator__user-box-stats-item">
                <strong>200</strong> Concepts Learned
              </div>
            </div>

            <div className="story-creator__user-box-xp">
              <div className="story-creator__user-box-xp-text">
                <span>XP Points: <strong>{xpCurrent}</strong></span>
                <span>{xpPercentage}%</span>
              </div>
              <div className="story-creator__user-box-xp-bar">
                <div 
                  className="story-creator__user-box-xp-bar-fill" 
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <Button 
            className="story-creator__user-box-button"
            onClick={() => navigate("/achievements")}
          >
            <Trophy size={16} />
            View Achievements
          </Button>
        </div>

        <motion.div 
          className="story-creator__topics"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {topics.map((topic, index) => (
            <div className="story-creator__topic" key={index}>
              <div 
                className="story-creator__topic-header" 
                onClick={() => setOpenTopics(prev => ({...prev, [index]: !prev[index]}))}
              >
                <h3 className="story-creator__topic-title">{topic.title}</h3>
                <ChevronDown
                  size={20}
                  className={`story-creator__topic-icon ${openTopics[index] ? "story-creator__topic-icon--open" : ""}`}
                />
              </div>

              <div className={`story-creator__topic-content ${openTopics[index] ? "story-creator__topic-content--open" : ""}`}>
                <ul className="story-creator__topic-list">
                  {topic.subtopics.map((subtopic, i) => (
                    <li key={i} className="story-creator__topic-item">
                      <div className="story-creator__topic-item-content">
                        <div className="story-creator__topic-item-title">{subtopic}</div>
                        <div className="story-creator__topic-item-subtitle">Generate an interactive story</div>
                      </div>
                      <Button
                        onClick={() => handleGenerateStory(topic.title, subtopic)}
                        className="story-creator__generate-button"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="animate-spin mr-2" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2" />
                            Generate Story
                          </>
                        )}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}