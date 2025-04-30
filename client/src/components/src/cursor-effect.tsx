"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function CursorEffect() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [clicked, setClicked] = useState(false)
  const [linkHovered, setLinkHovered] = useState(false)
  const [hidden, setHidden] = useState(true)

  useEffect(() => {
    const addEventListeners = () => {
      document.addEventListener("mousemove", onMouseMove)
      document.addEventListener("mouseenter", onMouseEnter)
      document.addEventListener("mouseleave", onMouseLeave)
      document.addEventListener("mousedown", onMouseDown)
      document.addEventListener("mouseup", onMouseUp)
    }

    const removeEventListeners = () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseenter", onMouseEnter)
      document.removeEventListener("mouseleave", onMouseLeave)
      document.removeEventListener("mousedown", onMouseDown)
      document.removeEventListener("mouseup", onMouseUp)
    }

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })

      const hoveredElement = document.elementFromPoint(e.clientX, e.clientY)
      const isLink =
        hoveredElement instanceof HTMLAnchorElement ||
        hoveredElement instanceof HTMLButtonElement ||
        hoveredElement?.closest("button") ||
        hoveredElement?.closest("a")

      setLinkHovered(!!isLink)
    }

    const onMouseDown = () => {
      setClicked(true)
    }

    const onMouseUp = () => {
      setClicked(false)
    }

    const onMouseLeave = () => {
      setHidden(true)
    }

    const onMouseEnter = () => {
      setHidden(false)
    }

    addEventListeners()
    return () => removeEventListeners()
  }, [])

  return (
    <div className="cursor-effect-container">
      <motion.div
        className={`cursor-dot ${hidden ? "opacity-0" : "opacity-100"}`}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 9999,
          pointerEvents: "none",
          mixBlendMode: "difference",
        }}
        animate={{
          x: position.x - (clicked ? 6 : linkHovered ? 8 : 4),
          y: position.y - (clicked ? 6 : linkHovered ? 8 : 4),
          scale: clicked ? 0.5 : linkHovered ? 1.5 : 1,
        }}
        transition={{
          type: "spring",
          mass: 0.3,
          stiffness: 200,
          damping: 20,
        }}
      >
        <div
          className={`h-2 w-2 rounded-full bg-white ${clicked ? "scale-50" : linkHovered ? "scale-150" : "scale-100"}`}
        />
      </motion.div>
      <motion.div
        className={`cursor-ring ${hidden ? "opacity-0" : "opacity-100"}`}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 9998,
          pointerEvents: "none",
          mixBlendMode: "difference",
        }}
        animate={{
          x: position.x - (linkHovered ? 16 : 12),
          y: position.y - (linkHovered ? 16 : 12),
          scale: clicked ? 0.8 : linkHovered ? 1.5 : 1,
        }}
        transition={{
          type: "spring",
          mass: 0.5,
          stiffness: 150,
          damping: 15,
        }}
      >
        <div
          className={`h-6 w-6 rounded-full border border-white ${
            clicked ? "scale-75" : linkHovered ? "scale-125" : "scale-100"
          }`}
        />
      </motion.div>
      <style >{`
        body {
          cursor: none !important;
        }
        
        a, button, [role="button"], input, select, textarea {
          cursor: none !important;
        }
      `}</style>
    </div>
  )
}
