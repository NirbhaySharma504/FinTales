"use client"
import React from "react"
import { motion } from "framer-motion"
import { CharacterSprite } from "./CharacterSprite"
import "./Components/StoryScene.scss"

interface StorySceneProps {
  background?: string
  character?: string
}

const sceneTransitions = {
  background: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.8 },
  },
  character: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.5, delay: 0.3 },
  },
}

export const StoryScene = ({ background, character }: StorySceneProps) => {
  return (
    <div className="story-scene">
      <motion.div
        className="story-scene__background"
        style={{ backgroundImage: `url(${background})` }}
        {...sceneTransitions.background}
      >
        <div className="story-scene__overlay" />
      </motion.div>

      {character && (
        <motion.div
          className="story-scene__character"
          {...sceneTransitions.character}
        >
          <CharacterSprite imageUrl={character} />
        </motion.div>
      )}
    </div>
  )
}