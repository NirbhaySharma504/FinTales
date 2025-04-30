"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from "./Components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./Components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Components/Tabs"
import { BookOpen, ChevronLeft, FileText, HelpCircle, MessageSquare } from "lucide-react"
import "./Components/SummaryPage.scss"

interface Summary {
  topic: string;
  learning_summary: {
    key_points: string[];
    benefits: string[];
    real_world_example: string;
  }
}

interface TutorResponse {
  answer: string;
  sources: string[];
  confidence: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}



export default function SummaryPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showChat, setShowChat] = useState(false)
  const [chatMessage, setChatMessage] = useState("")
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const [storyData, setStoryData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tutorConfidence, setTutorConfidence] = useState<number>(0);
  const [sources, setSources] = useState<string[]>([]);
  
  // Extract storyId from URL query parameters
  const queryParams = new URLSearchParams(location.search)
  const storyId = queryParams.get('storyId')

  useEffect(() => {
    const fetchStoryData = async () => {
      try {
        setLoading(true)
        const endpoint = storyId && storyId !== 'latest'
          ? `http://localhost:8000/api/story/${storyId}`
          : 'http://localhost:8000/api/latest-story'
        
        const response = await fetch(endpoint)
        const data = await response.json()
        if (data.success) {
          setStoryData(data)
        }
      } catch (error) {
        console.error('Error fetching story data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStoryData()
  }, [storyId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
  
    const userMessage = { role: "user" as const, content: chatMessage };
    setChatHistory(prev => [...prev, userMessage]);
  
    try {
      const response = await fetch('http://localhost:5000/api/tutor/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...chatHistory, userMessage],
          context: { 
            storyId, 
            topic: storyData?.summary?.topic 
          }
        })
      });
  
      const data = await response.json();
      if (data.success) {
        const tutorResponse: TutorResponse = data.response;
        setChatHistory(prev => [...prev, {
          role: "assistant" as const,
          content: tutorResponse.answer
        }]);
        setTutorConfidence(tutorResponse.confidence);
        setSources(tutorResponse.sources);
      }
    } catch (error) {
      console.error('Chat error:', error);
    }
  
    setChatMessage("");
  };

  // Function to navigate to quiz with storyId
  const handleTakeQuiz = () => {
    navigate(`/quiz?storyId=${storyId || 'latest'}`)
  }

  if (loading) {
    return (
      <div className="summary-page">
        <div className="summary-page__loading">
          <div className="summary-page__spinner"></div>
          <p>Loading summary...</p>
        </div>
      </div>
    )
  }

  // Get the financial concept from story data if available
  const financialConcept = storyData?.story?.visuals?.financial_elements || "Emergency Funds"
  const storyTitle = storyData?.story?.plot?.title || "Financial Adventure"
  
  // Get summary data if available
  const summaryTopic = storyData?.summary?.learning_summary?.topic || storyTitle
  const summaryText = storyData?.summary?.learning_summary?.summary || ""
  

  return (
    <div className="summary-page">
      <div className="summary-page__container">
        <div className="summary-page__header">
          <button className="btn btn--outline" onClick={() => navigate(-1)}>
            <ChevronLeft className="icon" />
          </button>
          <motion.h1
            className="summary-page__header-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Story Complete: {summaryTopic}
          </motion.h1>
        </div>

        <div className="summary-page__grid">
          <div className="summary-page__main">
            <div className="summary-page__tabs">
              <div className="summary-page__tabs-list">
                <button className="summary-page__tabs-trigger summary-page__tabs-trigger--active">Concept Summary</button>
                
              </div>

              <div className="summary-page__card">
                <div className="summary-page__card-header">
                  <h2>{storyData?.summary?.topic || financialConcept}</h2>
                  <p>Key financial concept from your story</p>
                </div>
                <div className="summary-page__card-content">
  <div className="summary-page__concept">
    <div className="summary-page__concept-intro">
      <h3>Story Summary</h3>
      
      <h4>Key Points</h4>
      <ul>
        {storyData?.summary?.learning_summary?.key_points.map((point, index) => (
          <li key={index}>{point}</li>
        ))}
      </ul>

      <h4>Benefits</h4>
      <ul>
        {storyData?.summary?.learning_summary?.benefits.map((benefit, index) => (
          <li key={index}>{benefit}</li>
        ))}
      </ul>

      <h4>Real World Application</h4>
      <p>{storyData?.summary?.learning_summary?.real_world_example}</p>
    </div>
  </div>
</div>
                <div className="summary-page__card-footer">
                  <button className="btn btn--primary" onClick={handleTakeQuiz}>
                    <FileText className="icon" /> Take the Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="summary-page__sidebar">
            <div className="summary-page__card">
              <div className="summary-page__card-header">
                <h2>Need Help?</h2>
                <p>Get assistance with financial concepts</p>
              </div>
              <div className="summary-page__chat">
                {showChat ? (
                  <div className="summary-page__chat-container">
                    <div className="summary-page__chat-messages">
                      {chatHistory.length === 0 ? (
                        <div className="summary-page__chat-empty">
                          <MessageSquare className="icon floating-icon" />
                          <p>Ask the tutor</p>
                        </div>
                      ) : (
                        chatHistory.map((msg, i) => (
                          <div
                            key={i}
                            className={`summary-page__chat-message ${
                              msg.role === "user" ? "message-user" : "message-assistant"
                            }`}
                          >
                            {msg.content}
                          </div>
                        ))
                      )}
                    </div>
                    <form onSubmit={handleSendMessage} className="summary-page__chat-input">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder={`Ask about ${financialConcept}...`}
                      />
                      <button type="submit" className="btn btn--icon">
                        <svg viewBox="0 0 24 24" className="icon">
                          <path d="m22 2-7 20-4-9-9-4Z" />
                          <path d="M22 2 11 13" />
                        </svg>
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="summary-page__chat-welcome">
                    <HelpCircle className="icon floating-icon" />
                    <h3>Have Questions?</h3>
                    <p>Chat with your personal tutor to learn more about the topic.</p>
                    <button className="btn btn--primary" onClick={() => setShowChat(true)}>
                      <MessageSquare className="icon" /> Chat with Tutor
                    </button>
                  </div>
                )}
              </div>
              <div className="summary-page__card-footer">
                <button className="btn btn--outline" onClick={() => navigate(`/quiz?storyId=${storyId || 'latest'}`)}>
                  <FileText className="icon" /> Take the Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
