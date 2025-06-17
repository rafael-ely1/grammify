import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import { toast } from 'sonner'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showResend, setShowResend] = useState(false)
  const { signIn, resendConfirmationEmail } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signIn({ email, password })
    } catch (error) {
      console.error('Login failed:', error)
      
      // Check if it's an email confirmation error
      if (error instanceof Error && error.message.includes('Email not confirmed')) {
        setShowResend(true)
        toast.error(
          'Please confirm your email address before signing in. Check your inbox for the confirmation link.',
          { duration: 5000 }
        )
      } else {
        toast.error('Failed to sign in. Please check your credentials.')
      }
    }
  }

  const handleResendConfirmation = async () => {
    try {
      await resendConfirmationEmail(email)
      toast.success('Confirmation email has been resent. Please check your inbox.')
    } catch (error) {
      toast.error('Failed to resend confirmation email. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/signup" className="font-medium text-teal-600 hover:text-teal-500">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
            >
              Sign in
            </button>

            {showResend && (
              <button
                type="button"
                onClick={handleResendConfirmation}
                className="group relative flex w-full justify-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-200"
              >
                Resend confirmation email
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
} 