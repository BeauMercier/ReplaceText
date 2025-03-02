import { useState, useEffect } from 'react'
import TextReplacer from './TextReplacer'
import ClientManager from './ClientManager'
import BlogManager from './components/pages/BlogManager'

// Use environment variable instead of hardcoding API key
const DEFAULT_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || ''

function App() {
  const [apiKey, setApiKey] = useState(() => {
    const savedKey = localStorage.getItem('openai_api_key')
    return savedKey || DEFAULT_API_KEY
  })
  const [currentPage, setCurrentPage] = useState('clientManager') // Default to Client Manager

  useEffect(() => {
    localStorage.setItem('openai_api_key', apiKey)
  }, [apiKey])

  const handleApiKeyChange = (newKey: string) => {
    setApiKey(newKey);
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Sidebar with logo and navigation */}
      <div style={{ 
        width: '220px', 
        backgroundColor: '#1e293b', 
        color: 'white',
        padding: '20px 0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Logo */}
        <div style={{ 
          padding: '0 20px 20px 20px', 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '20px'
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '22px', 
            fontWeight: 'bold',
            color: '#ffffff'
          }}>
            DrasticDigital
          </h1>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '0 10px' }}>
          <button 
            onClick={() => setCurrentPage('clientManager')}
            style={{ 
              padding: '12px 15px', 
              backgroundColor: currentPage === 'clientManager' ? '#2563eb' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '15px',
              transition: 'background-color 0.2s'
            }}
          >
            Client Manager
          </button>
          <button 
            onClick={() => setCurrentPage('textReplacer')}
            style={{ 
              padding: '12px 15px', 
              backgroundColor: currentPage === 'textReplacer' ? '#2563eb' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '15px',
              transition: 'background-color 0.2s'
            }}
          >
            Text Replacer
          </button>
          <button 
            onClick={() => setCurrentPage('blogManager')}
            style={{ 
              padding: '12px 15px', 
              backgroundColor: currentPage === 'blogManager' ? '#2563eb' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '15px',
              transition: 'background-color 0.2s'
            }}
          >
            Blog Manager
          </button>
        </nav>
      </div>

      {/* Main content area */}
      <div style={{ 
        flex: 1, 
        padding: '20px',
        backgroundColor: '#f8fafc',
        overflowY: 'auto'
      }}>
        {currentPage === 'clientManager' && (
          <ClientManager />
        )}
        
        {currentPage === 'textReplacer' && (
          <TextReplacer apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />
        )}
        
        {currentPage === 'blogManager' && (
          <BlogManager />
        )}
      </div>
    </div>
  )
}

export default App
