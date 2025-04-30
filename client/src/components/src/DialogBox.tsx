"use client"
import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TypewriterText } from "./TyepwriterTest"
import { Button } from "./Components/button"
import { ChevronRight } from "lucide-react"
import "./Components/DialogBox.scss"

export const DialogBox = ({ dialogue, onNext }) => {
  const [isTyping, setIsTyping] = useState(true)
  const [isSkipped, setIsSkipped] = useState(false)

  const handleTypingComplete = () => {
    setIsTyping(false)
  }

  const handleSkip = () => {
    if (isTyping) {
      setIsSkipped(true)
      setIsTyping(false)
    }
  }

  useEffect(() => {
    setIsTyping(true)
    setIsSkipped(false)
  }, [dialogue])

  if (!dialogue) return null

  return (
    <motion.div
      className="dialog-box"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      <div className="dialog-box__container">
        <div className="dialog-box__character-name">
          {dialogue.character}
        </div>

        <div className="dialog-box__text">
          {isSkipped ? (
            <p>{dialogue.text}</p>
          ) : (
            <TypewriterText 
              text={dialogue.text} 
              onComplete={handleTypingComplete} 
              speed={isTyping ? 30 : 0} 
            />
          )}
        </div>

        <div className="dialog-box__footer">
          {dialogue.hint && (
            <div className="dialog-box__hint">
              <span>Hint:</span> {dialogue.hint}
            </div>
          )}

          <div className="dialog-box__controls">
            {isTyping && (
              <Button 
                variant="outline" 
                onClick={handleSkip} 
                className="dialog-box__skip-button"
              >
                Skip
              </Button>
            )}

            <AnimatePresence>
              {!isTyping && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <Button
                    onClick={onNext}
                    className="dialog-box__next-button"
                  >
                    Next <ChevronRight />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
