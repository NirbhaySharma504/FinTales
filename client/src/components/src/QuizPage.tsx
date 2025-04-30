"use client"
import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from "./Components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./Components/card"
import { RadioGroup, RadioGroupItem } from "./Components/radio-group"
import { Label } from "./Components/label"
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle } from "lucide-react"
import "./Components/QuizPage.scss"

interface QuizOption {
  text: string;
  is_correct: boolean;
}

interface QuizQuestion {
  question: string;
  options: QuizOption[];
  explanation: string;
}

interface Quiz {
  topic: string;
  difficulty: string;
  age_group: string;
  questions: QuizQuestion[];
}

export default function QuizPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const queryParams = new URLSearchParams(location.search)
  const storyId = queryParams.get("storyId")

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true)
        const endpoint = storyId && storyId !== 'latest'
          ? `http://localhost:8000/api/story/${storyId}`
          : 'http://localhost:8000/api/latest-story'
        
        const response = await fetch(endpoint)
        const data = await response.json()
        
        if (data.success && data.quiz) {
          setQuiz(data.quiz)
        } else {
          console.error("Quiz data not found:", data)
        }
      } catch (error) {
        console.error("Error fetching quiz:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuiz()
  }, [storyId])

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null || !quiz) return;

    setIsAnswered(true);
    // Find the correct answer index
    const correctIndex = quiz.questions[currentQuestion].options.findIndex(
      option => option.is_correct
    );
    
    if (selectedOption === correctIndex) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!quiz) return;
    
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  };

  if (loading) {
    return (
      <div className="quiz-container quiz-loading">
        <div className="loading-text">Loading quiz...</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="quiz-container">
        <Card className="quiz-card quiz-not-available">
          <CardHeader>
            <CardTitle>Quiz Not Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Sorry, the quiz for this story could not be loaded.</p>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => navigate(`/summary?storyId=${storyId || 'latest'}`)}
              className="back-to-summary-btn"
            >
              Back to Summary
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-content">
        <div className="quiz-header">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(`/summary?storyId=${storyId || 'latest'}`)}
            className="back-button"
          >
            <ChevronLeft />
          </Button>
          <motion.h1
            className="quiz-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {quiz.topic} Quiz
          </motion.h1>
        </div>

        {!quizCompleted ? (
          <Card className="quiz-card">
            <CardHeader>
              <div className="quiz-progress">
                <CardTitle>
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </CardTitle>
                <span className="quiz-score">
                  Score: {score}/{currentQuestion}
                </span>
              </div>
              <CardDescription>Test your knowledge about {quiz.topic}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="quiz-question-container">
                <h3 className="quiz-question">{quiz.questions[currentQuestion].question}</h3>

                <RadioGroup value={selectedOption?.toString()}>
                  {quiz.questions[currentQuestion].options.map((option, index) => (
                    <div
                      key={index}
                      className={`quiz-option ${
                        selectedOption === index
                          ? isAnswered
                            ? option.is_correct
                              ? "correct"
                              : "incorrect"
                            : "selected"
                          : ""
                      }`}
                      onClick={() => handleOptionSelect(index)}
                    >
                      <RadioGroupItem
                        value={index.toString()}
                        id={`option-${index}`}
                        checked={selectedOption === index}
                      />
                      <Label htmlFor={`option-${index}`} className="quiz-option-label">
                        {option.text}
                      </Label>
                      {isAnswered &&
                        (option.is_correct ? (
                          <CheckCircle2 className="quiz-option-icon correct" />
                        ) : (
                          selectedOption === index && <XCircle className="quiz-option-icon incorrect" />
                        ))}
                    </div>
                  ))}
                </RadioGroup>
                
                {isAnswered && (
                  <div className="quiz-explanation">
                    <h4>Explanation:</h4>
                    <p>{quiz.questions[currentQuestion].explanation}</p>
                  </div>
                )}
              </div>
            </CardContent>
            {/* Add a custom class to the CardFooter for better styling control */}
            <CardFooter className="quiz-footer">
              <div className="quiz-footer-buttons">
                <Button
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestion === 0}
                  className="prev-button"
                >
                  <ChevronLeft /> Previous
                </Button>

                {!isAnswered ? (
                  <Button
                    onClick={handleCheckAnswer}
                    disabled={selectedOption === null}
                    className="check-button"
                  >
                    Check Answer
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextQuestion}
                    className="next-button"
                  >
                    {currentQuestion < quiz.questions.length - 1 ? "Next Question" : "See Results"}{" "}
                    <ChevronRight />
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        ) : (
          <Card className="quiz-card quiz-results">
            <CardHeader>
              <CardTitle>Quiz Complete!</CardTitle>
              <CardDescription>Your final score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="quiz-score-container">
                <div className="quiz-final-score">
                  {score}/{quiz.questions.length}
                </div>
                <p className="quiz-score-message">
                  {score === quiz.questions.length
                    ? "Perfect score! You're a financial expert!"
                    : score >= quiz.questions.length * 0.7
                    ? "Great job! You have a solid understanding of the concepts."
                    : "Good effort! Review the concepts and try again."}
                </p>
              </div>

              <div className="quiz-progress-bar-container">
                <div
                  className="quiz-progress-bar"
                  style={{ width: `${(score / quiz.questions.length) * 100}%` }}
                ></div>
              </div>
            </CardContent>
            <CardFooter className="quiz-footer">
              <div className="quiz-footer-buttons">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentQuestion(0)
                    setSelectedOption(null)
                    setIsAnswered(false)
                    setScore(0)
                    setQuizCompleted(false)
                  }}
                  className="retry-button"
                >
                  Retry Quiz
                </Button>
                <Button
                  onClick={() => navigate("/")}
                  className="summary-button"
                >
                  Back to Home
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
