"use client"

import React, { useState, useEffect } from "react"

interface TypewriterTextProps {
  text: string
  onComplete?: () => void
  speed?: number
}

export const TypewriterText = ({ text, onComplete, speed = 30 }: TypewriterTextProps) => {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, speed)

      return () => clearTimeout(timeout)
    } else if (onComplete) {
      onComplete()
    }
  }, [currentIndex, text, onComplete, speed])

  useEffect(() => {
    setDisplayedText("")
    setCurrentIndex(0)
  }, [text])

  return (
    <div className="typewriter-text">
      {displayedText}
      {currentIndex < text.length && <span className="cursor animate-pulse">|</span>}
    </div>
  )
}
