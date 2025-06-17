import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/auth'
import { Dashboard } from './pages/Dashboard'
import { Settings } from './pages/Settings'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Footer } from './components/Footer'
import { Toaster } from 'sonner'

export default function App() {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        {user ? (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
      <Toaster position="top-right" />
      <Footer />
    </div>
  )
} 