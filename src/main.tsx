import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SpeedInsights } from '@vercel/speed-insights/react'
import App from './App'
import './index.css'

// Console logs for debugging
console.log('Script executing, environment:', import.meta.env.MODE)
console.log('Base URL:', import.meta.env.BASE_URL)

try {
  const rootElement = document.getElementById('root')
  
  if (rootElement) {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
        <SpeedInsights />
      </StrictMode>
    )
  } else {
    console.error('Root element not found')
  }
} catch (error) {
  console.error('Fatal error:', error)
}
