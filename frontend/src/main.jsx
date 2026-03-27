import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // This MUST be here for Tailwind to work!
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* This wrapper ensures our app always fills the screen 
        and uses a modern sans-serif font stack.
    */}
    <div className="antialiased text-slate-900 bg-slate-50 min-h-screen">
      <App />
    </div>
  </StrictMode>,
)