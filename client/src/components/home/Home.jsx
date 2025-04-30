"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronDown, Trophy, LogOut, Sparkles, Loader2, BookOpen } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import "./home.scss"

const Home = () => {
  const { userProfile, currentUser, logout } = useAuth()
  const navigate = useNavigate()
  // Track loading state per subtopic instead of a global loading state
  const [loadingStates, setLoadingStates] = useState({})
  const [openTopicIndex, setOpenTopicIndex] = useState(null)
  const [userData, setUserData] = useState({
    name: "Loading...",
    photoURL: "/placeholder.svg?height=80&width=80",
    xp: 0
  })

  // Debug effect to log user profile data
  useEffect(() => {
    console.log("Auth context data:", { userProfile, currentUser })
    
    if (userProfile) {
      console.log("User profile found:", userProfile)
      setUserData({
        name: userProfile.name || userProfile.displayName || "User",
        photoURL: userProfile.profilePicture || "/placeholder.svg?height=80&width=80",
        xp: userProfile.xp || 0
      })
    } else if (currentUser) {
      console.log("Current user found but no profile:", currentUser)
      setUserData({
        name: currentUser.displayName || "User",
        photoURL: currentUser.photoURL || "/placeholder.svg?height=80&width=80",
        xp: 0
      })
    }
  }, [userProfile, currentUser])

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

  const toggleTopic = (index) => {
    setOpenTopicIndex((prevIndex) => (prevIndex === index ? null : index))
  }

  // Updated story generation functionality with per-subtopic loading state
  const handleGenerateStory = async (topic, subtopic) => {
    // Create a unique loading ID for this specific subtopic
    const loadingId = `${topic}-${subtopic}`
    
    // Set only this specific subtopic to loading
    setLoadingStates(prev => ({ ...prev, [loadingId]: true }))
    
    try {
      // Navigate to VisualNovel with query param to indicate "generating" state
      navigate('/visual-novel?state=generating')
      
      // Make API call to generate story - this continues in the background
      const response = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          difficulty: "beginner",
          concept: {
            topic: topic.replace(/[^\w\s]/g, ''), // Remove emojis and special characters
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
        // The API call has completed - the VisualNovel component will handle this
        // We could send an event or update a global state here
        console.log("Story generated successfully:", data.storyId)
      } else {
        console.error("Failed to generate story:", data)
        alert("Failed to generate story. Please try again.")
        // Redirect back to home if there's an error
        navigate('/')
      }
    } catch (error) {
      console.error("Error generating story:", error)
      alert("Error generating story. Please check your connection and try again.")
      // Redirect back to home if there's an error
      navigate('/')
    } finally {
      // Clear loading state only for this specific subtopic
      setLoadingStates(prev => ({ ...prev, [loadingId]: false }))
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const xpTotal = 1400
  const xpCurrent = userData.xp
  const xpPercentage = Math.min(100, Math.round((xpCurrent / xpTotal) * 100))

  return (
    <div className="home">
      <div className="home__content">
        {/* User Profile Box */}
        <div className="home__user-box">
          <img
            src={userData.photoURL}
            alt="Profile"
            className="home__user-box-avatar"
          />

          <div className="home__user-box-info">
            <h2 className="home__user-box-name">{userData.name}</h2>

            <div className="home__user-box-xp">
              <div className="home__user-box-xp-text">
                <span>XP Points: <strong>{xpCurrent}</strong></span>
                <span>{xpPercentage}%</span>
              </div>
              <div className="home__user-box-xp-bar">
                <div className="home__user-box-xp-bar-fill" style={{ width: `${xpPercentage}%` }}></div>
              </div>
            </div>
          </div>

          <button 
            className="home__user-box-button home__user-box-button--primary" 
            onClick={() => navigate("/achievements")}
          >
            <Trophy size={16} />
            View Achievements
          </button>

          <button 
            className="home__user-box-button" 
            onClick={() => navigate("/preferences")}
          >
            <Sparkles size={16} />
            Update Preferences
          </button>

          
        </div>

        {/* Topics */}
        <h2 className="home__section-header">
          <BookOpen size={20} className="mr-2" />
          Learning Topics
        </h2>
        
        <div className="home__topics">
          {topics.map((topic, index) => (
            <div className="home__topic" key={index}>
              <div className="home__topic-header" onClick={() => toggleTopic(index)}>
                <h3 className="home__topic-header-title">{topic.title}</h3>
                <ChevronDown
                  size={20}
                  className={`home__topic-header-icon ${openTopicIndex === index ? "home__topic-header-icon--open" : ""}`}
                />
              </div>

              <div className={`home__topic-content ${openTopicIndex === index ? "home__topic-content--open" : ""}`}>
                <ul className="home__topic-list">
                  {topic.subtopics.map((subtopic, i) => {
                    // Create a unique loading ID for this specific subtopic
                    const loadingId = `${topic.title}-${subtopic}`
                    // Check if this specific subtopic is loading
                    const isLoading = !!loadingStates[loadingId]
                    
                    return (
                      <li key={i} className="home__topic-item">
                        <div className="home__topic-item-content">
                          <div className="home__topic-item-title">{subtopic}</div>
                          <div className="home__topic-item-subtitle">Generate an interactive story</div>
                        </div>
                        <button
                          onClick={() => handleGenerateStory(topic.title, subtopic)}
                          className="home__generate-button"
                          disabled={isLoading}
                        >
                          {isLoading ? (
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
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
