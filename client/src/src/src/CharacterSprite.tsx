import React from "react"
import { motion } from "framer-motion"

interface CharacterSpriteProps {
  imageUrl: string
}

export const CharacterSprite = ({ imageUrl }: CharacterSpriteProps) => {
  return (
    <motion.div
      className="character-sprite h-full"
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 50, opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
    >
      <motion.div
        className="h-full relative"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 3,
          ease: "easeInOut",
        }}
      >
        <img
          src={imageUrl || "/placeholder.svg"}
          alt="Character"
          className="h-full w-auto object-contain opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          loading="eager"
        />
      </motion.div>
    </motion.div>
  )
}
