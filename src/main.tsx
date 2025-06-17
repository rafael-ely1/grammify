import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './providers/AuthProvider'
import { initializeDatabase } from './lib/supabase'
import App from './App'
import './index.css'

// Initialize the database
initializeDatabase().catch(err => {
  console.error('Failed to initialize database:', err)
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
) 