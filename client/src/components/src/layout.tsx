import React from "react"
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from "./Components/theme-provider"
import CursorEffect from "./cursor-effect"
import "./globals.css"

// Import Poppins from Google Fonts
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'

export default function App({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <BrowserRouter>
      <div className="font-poppins">
        <ThemeProvider defaultTheme="dark" storageKey="finquest-theme">
          <CursorEffect />
          {children}
        </ThemeProvider>
      </div>
    </BrowserRouter>
  )
}
