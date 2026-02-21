import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    <Toaster
      position="top-right"
      containerStyle={{ zIndex: 99999 }}
      toastOptions={{
        duration: 3500,
        style: {
          background: '#fff',
          color: '#1e293b',
          boxShadow: '0 4px 12px rgba(0,0,0,.15)',
          borderRadius: '10px',
          padding: '12px 16px',
          fontSize: '14px',
        },
        success: {
          iconTheme: { primary: '#22c55e', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#fff' },
          duration: 4000,
        },
      }}
    />
  </StrictMode>,
)
