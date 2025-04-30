import React, { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "./Components/button"
import { Save, Upload, Volume2, VolumeX } from "lucide-react"

interface ControlsProps {
  onSave: () => void
  onLoad: () => void
  coverImage?: string
  title?: string
  progress?: string
}

export const Controls = ({ onSave, onLoad, coverImage, title, progress }: ControlsProps) => {
  const [muted, setMuted] = useState(false)

  return (
    <motion.div
      className="controls fixed top-4 right-4 flex items-start gap-4 z-40"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="story-info flex items-center gap-3 bg-black/50 backdrop-blur-sm p-2 rounded-lg border border-white/10">
        {coverImage && (
          <div className="relative h-12 w-12 rounded-md overflow-hidden">
            <img 
              src={coverImage || "/placeholder.svg"} 
              alt="Story Cover" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        )}
        <div className="text-white">
          {title && <p className="font-semibold text-sm">{title}</p>}
          {progress && <p className="text-xs text-white/70">{progress}</p>}
        </div>
      </div>

      <div className="control-buttons flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onSave}
          className="bg-black/50 backdrop-blur-sm border-white/10 hover:bg-white/10 text-white"
        >
          <Save className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onLoad}
          className="bg-black/50 backdrop-blur-sm border-white/10 hover:bg-white/10 text-white"
        >
          <Upload className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setMuted(!muted)}
          className="bg-black/50 backdrop-blur-sm border-white/10 hover:bg-white/10 text-white"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>
    </motion.div>
  )
}
