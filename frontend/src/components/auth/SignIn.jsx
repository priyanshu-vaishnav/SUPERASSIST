import React, { useState, useEffect, useCallback } from 'react'
import { useSignInuserMutation } from '../../redux/api/authApi'
import StatusScreen from '../main/StatusScreen'
import { useNavigate } from 'react-router'
import { useDispatch } from 'react-redux'
import { getUser } from '../../redux/slices/user.slice'
import './SignIn.css'

function SignIn() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const initialFormState = {
    email: '',
    password: ''
  }

  const [formData, setFormData] = useState(initialFormState)
  const [validationErrors, setValidationErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const [signInUser, { isLoading, isError, isSuccess, error, reset }] =
    useSignInuserMutation()

  // Load remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail')
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }))
      setRememberMe(true)
    }
  }, [])

  // Reset success state after navigation delay
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => reset(), 1500)
      return () => clearTimeout(timer)
    }
  }, [isSuccess, reset])

  // Centralized validation logic
  const validate = useCallback((data) => {
    const errors = {}

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!data.email.trim()) {
      errors.email = 'Email is required'
    } else if (!emailRegex.test(data.email.trim())) {
      errors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!data.password) {
      errors.password = 'Password is required'
    } else if (data.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    return errors
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear field error on change
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }))
    }

    // Clear submit error when user starts typing
    if (submitError) {
      setSubmitError('')
    }
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))

    const fieldErrors = validate(formData)
    setValidationErrors((prev) => ({ ...prev, [name]: fieldErrors[name] || '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Mark all fields as touched
    setTouched({ email: true, password: true })

    const errors = validate(formData)
    setValidationErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    setSubmitError('')

    try {
      const result = await signInUser({
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      }).unwrap()

      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email.trim().toLowerCase())
      } else {
        localStorage.removeItem('rememberedEmail')
      }

      // Store user data safely
      if (result?.user?.id) {
        localStorage.setItem('userId', result.user.id)
      }

      if (result?.user?.user_metadata) {
        dispatch(getUser(result.user.user_metadata))
      }

      // Optional: Store token if available
      if (result?.session?.access_token) {
        localStorage.setItem('token', result.session.access_token)
      }

      navigate('/dashboard')
    } catch (err) {
      console.error('Sign in failed:', err)
      setSubmitError(
        err?.data?.message || 'Invalid email or password. Please try again.'
      )
    }
  }

  const getFieldClassName = (fieldName) => {
    if (touched[fieldName] && validationErrors[fieldName]) return 'form-control is-invalid'
    if (touched[fieldName] && !validationErrors[fieldName] && formData[fieldName]) {
      return 'form-control is-valid'
    }
    return 'form-control'
  }

  return (
    <div className="signin-wrapper">
      {isLoading && <StatusScreen status={true} type="loading" />}

      <div className="signin-container">
        <div className="signin-card">
          <div className="signin-header">
            <div className="signin-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
            </div>
            <h2 className="signin-title">Welcome Back</h2>
            <p className="signin-subtitle">Sign in to continue to your account</p>
          </div>

          {/* Submit Error Banner */}
          {(submitError || (isError && error?.data?.message)) && (
            <div className="alert-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{submitError || error?.data?.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="signin-form" noValidate>
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </span>
                <input
                  type="email"
                  className={getFieldClassName('email')}
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
              {touched.email && validationErrors.email && (
                <div className="error-message">{validationErrors.email}</div>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={getFieldClassName('password')}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
              {touched.password && validationErrors.password && (
                <div className="error-message">{validationErrors.password}</div>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="form-options">
              <label className="checkbox-wrapper">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <span className="checkmark"></span>
                <span className="checkbox-label">Remember me</span>
              </label>
              <a href="/forgot-password" className="forgot-link">
                Forgot password?
              </a>
            </div>

            <button type="submit" className="signin-button" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider">
            <span>OR</span>
          </div>

          {/* Social Sign In */}
          <div className="social-buttons">
            <button type="button" className="social-btn" disabled={isLoading} aria-label="Sign in with Google">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 11v3.2h4.5c-.2 1.3-1.5 3.8-4.5 3.8-2.7 0-4.9-2.2-4.9-5s2.2-5 4.9-5c1.5 0 2.6.6 3.2 1.2l2.2-2.1C15.9 5.5 14.1 4.7 12 4.7c-4 0-7.3 3.3-7.3 7.3s3.3 7.3 7.3 7.3c4.2 0 7-3 7-7.2 0-.5-.1-.8-.1-1.1H12z"/>
              </svg>
            </button>
            <button type="button" className="social-btn" disabled={isLoading} aria-label="Sign in with GitHub">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.17c-3.34.73-4.04-1.41-4.04-1.41-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.31-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23.96-.27 1.98-.4 3-.4s2.04.13 3 .4c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.87.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.56 21.79 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </button>
            <button type="button" className="social-btn" disabled={isLoading} aria-label="Sign in with Twitter">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1DA1F2">
                <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733a4.67 4.67 0 0 0 2.048-2.578 9.3 9.3 0 0 1-2.958 1.13 4.66 4.66 0 0 0-7.938 4.25 13.229 13.229 0 0 1-9.602-4.868c-.4.69-.63 1.49-.63 2.342A4.66 4.66 0 0 0 3.96 9.824a4.647 4.647 0 0 1-2.11-.583v.06a4.66 4.66 0 0 0 3.737 4.568 4.692 4.692 0 0 1-2.104.08 4.661 4.661 0 0 0 4.352 3.234 9.348 9.348 0 0 1-5.786 1.995 9.5 9.5 0 0 1-1.112-.065 13.175 13.175 0 0 0 7.14 2.093c8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602a9.47 9.47 0 0 0 2.323-2.41l.002-.003z"/>
              </svg>
            </button>
          </div>

          <p className="signin-footer">
            Don't have an account?{' '}
            <a href="/signup" className="signin-link">Create one</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignIn
