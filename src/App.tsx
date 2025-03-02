import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import TextReplacer from './TextReplacer'
import ClientManager from './ClientManager'
import BlogManager from './BlogManager'
import Navbar from './components/layout/Navbar'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './components/pages/Dashboard'
import Clients from './components/pages/Clients'
import ContentManager from './components/pages/ContentManager'
import SeoTools from './components/pages/SeoTools'
import Analytics from './components/pages/Analytics'

// Use environment variable for API key - support both Vite and Create React App formats
const DEFAULT_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || 
                        process.env.REACT_APP_OPENAI_API_KEY || 
                        ''

function App() {
  const [apiKey, setApiKey] = useState(() => {
    const savedKey = localStorage.getItem('openai_api_key')
    return savedKey || DEFAULT_API_KEY
  })
  
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    localStorage.setItem('openai_api_key', apiKey)
  }, [apiKey])

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <Sidebar isOpen={sidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar onMenuClick={handleMenuClick} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/content" element={<ContentManager />} />
              <Route path="/text-replacer" element={<TextReplacer apiKey={apiKey} onApiKeyChange={setApiKey} />} />
              <Route path="/blog-manager" element={<BlogManager />} />
              <Route path="/seo-tools" element={<SeoTools />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App 