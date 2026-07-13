import React, { useState, useEffect, useCallback } from 'react'
import { useSignupUserMutation } from '../../redux/api/authApi'
import StatusScreen from '../main/StatusScreen'
import './SignUp.css'

function SignUp() {
  const initialFormState = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  }

  const [formData, setFormData] = useState(initialFormState)
  const [validationErrors, setValidationErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [signupUser, { isLoading, isError, isSuccess, error, reset }] =
    useSignupUserMutation()

  // Reset form on successful signup
  useEffect(() => {
    if (isSuccess) {
      setFormData(initialFormState)
      setTouched({})
      setValidationErrors({})
      const timer = setTimeout(() => reset(), 2500)
      return () => clearTimeout(timer)
    }
  }, [isSuccess, reset])

  // Centralized validation logic
  const validate = useCallback((data) => {
    const errors = {}

    // Name validation
    if (!data.name.trim()) {
      errors.name = 'Name is required'
    } else if (data.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters'
    } else if (data.name.trim().length > 50) {
      errors.name = 'Name must be less than 50 characters'
    }

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
    } else if (data.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
      errors.password = 'Must contain uppercase, lowercase & number'
    }

    // Confirm password validation
    if (!data.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
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
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true
    })

    const errors = validate(formData)
    setValidationErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    try {
      await signupUser({
        username: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      }).unwrap()
    } catch (err) {
      console.error('Signup failed:', err)
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
    <div className="signup-wrapper">
      {isLoading && <StatusScreen status={true} type="loading" />}
      {isError && (
        <StatusScreen
          status={true}
          type="error"
          message={error?.data?.message || 'Something went wrong. Please try again.'}
        />
      )}
      {isSuccess && <StatusScreen status={true} type="success" />}

      <div className="signup-container">
        <div className="signup-card">
          <div className="signup-header">
            <div className="signup-icon">
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
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
            </div>
            <h2 className="signup-title">Create Account</h2>
            <p className="signup-subtitle">Join us today and get started in seconds</p>
          </div>

          <form onSubmit={handleSubmit} className="signup-form" noValidate>
            {/* Name Field */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full Name</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </span>
                <input
                  type="text"
                  className={getFieldClassName('name')}
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  disabled={isLoading}
                />
              </div>
              {touched.name && validationErrors.name && (
                <div className="error-message">{validationErrors.name}</div>
              )}
            </div>

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
                  placeholder="Create a strong password"
                  autoComplete="new-password"
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

            {/* Confirm Password Field */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={getFieldClassName('confirmPassword')}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
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
              {touched.confirmPassword && validationErrors.confirmPassword && (
                <div className="error-message">{validationErrors.confirmPassword}</div>
              )}
            </div>

            <button type="submit" className="signup-button" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="signup-footer">
            Already have an account?{' '}
            <a href="/signin" className="signup-link">Sign In</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignUp
