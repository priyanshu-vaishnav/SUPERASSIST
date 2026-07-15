import React, { useState, useEffect, useCallback } from 'react'
import { useSignupUserMutation } from '../../redux/api/authApi'
import StatusScreen from '../main/StatusScreen'
import { Link, useNavigate } from 'react-router'
import './SignUp.css'
import { useCreateUserChatMutation } from '../../redux/api/chatApi'
import { setChatId } from '../../redux/slices/chat.slice'
import { useDispatch } from 'react-redux'

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
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [createUserChat, { isLoading: isCreating }] = useCreateUserChatMutation();
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [signupUser, { isLoading, isError, isSuccess, error, reset }] =
    useSignupUserMutation()

  // Calculate password strength
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(0)
      return
    }
    let strength = 0
    if (formData.password.length >= 8) strength++
    if (/[a-z]/.test(formData.password)) strength++
    if (/[A-Z]/.test(formData.password)) strength++
    if (/\d/.test(formData.password)) strength++
    if (/[^a-zA-Z0-9]/.test(formData.password)) strength++
    setPasswordStrength(strength)
  }, [formData.password])

  // Reset form on successful signup
  useEffect(() => {
    if (isSuccess) {

      setFormData(initialFormState)
      setTouched({})
      setValidationErrors({})
      setAcceptTerms(false)
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

    if (!acceptTerms) {
      return
    }

    try {
      await signupUser({
        username: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      }).unwrap()
try {
  const response = await createUserChat().unwrap();
  
  console.log("Full Response:", response);

  // 🌟 FIX: Check karo ki response mein 'data' hai aur wo object hai
  if (response && response.success && response.data) {
    const newChatId = response.data.id; // Yahan seedha ID milega
    
    dispatch(setChatId(newChatId));
     localStorage.setItem("chatId",newChatId)
    console.log("Chat ID set to:", newChatId);
    navigate('/dashboard');
  } else {
    console.error("API structure unexpected:", response);
  }

} catch (error) {
  console.error("Failed to create chat:", error);
}

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

  const getStrengthLabel = () => {
    if (passwordStrength === 0) return ''
    if (passwordStrength <= 2) return 'Weak'
    if (passwordStrength === 3) return 'Fair'
    if (passwordStrength === 4) return 'Good'
    return 'Strong'
  }

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return 'weak'
    if (passwordStrength === 3) return 'fair'
    if (passwordStrength === 4) return 'good'
    return 'strong'
  }

  return (
    <div className="signup-wrapper">
      {/* Animated Background */}
      <div className="bg-gradient">
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="bg-orb bg-orb-3"></div>
        <div className="bg-grid"></div>
      </div>

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
          {/* Brand Logo */}
          <div className="brand-logo">
            <div className="logo-glow"></div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
            <span>SuperAssist</span>
          </div>

          <div className="signup-header">
            <div className="signup-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
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

                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>

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

                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>

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

                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>

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

              {/* Password Strength Meter */}
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bars">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`strength-bar ${i <= passwordStrength ? `active ${getStrengthColor()}` : ''
                          }`}
                      ></div>
                    ))}
                  </div>
                  <span className={`strength-label ${getStrengthColor()}`}>
                    {getStrengthLabel()}
                  </span>
                </div>
              )}

              {touched.password && validationErrors.password && (
                <div className="error-message">{validationErrors.password}</div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <div className="input-wrapper">

                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>

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

            {/* Terms & Conditions */}
            <label className="terms-wrapper">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                disabled={isLoading}
              />
              <span className="terms-checkmark"></span>
              <span className="terms-text">
                I agree to the{' '}
                <a href="/terms" className="terms-link" onClick={(e) => e.stopPropagation()}>
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="terms-link" onClick={(e) => e.stopPropagation()}>
                  Privacy Policy
                </a>
              </span>
            </label>

            <button type="submit" className="signup-button" disabled={isLoading || !acceptTerms}>
              <span className="button-content">
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="divider">
            <span>OR</span>
          </div>

          {/* Social Sign Up */}
          <div className="social-buttons">
            <button type="button" className="social-btn" disabled={isLoading} aria-label="Sign up with Google">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 11v3.2h4.5c-.2 1.3-1.5 3.8-4.5 3.8-2.7 0-4.9-2.2-4.9-5s2.2-5 4.9-5c1.5 0 2.6.6 3.2 1.2l2.2-2.1C15.9 5.5 14.1 4.7 12 4.7c-4 0-7.3 3.3-7.3 7.3s3.3 7.3 7.3 7.3c4.2 0 7-3 7-7.2 0-.5-.1-.8-.1-1.1H12z" />
              </svg>
            </button>
            <button type="button" className="social-btn" disabled={isLoading} aria-label="Sign up with GitHub">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.17c-3.34.73-4.04-1.41-4.04-1.41-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.31-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23.96-.27 1.98-.4 3-.4s2.04.13 3 .4c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.87.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.56 21.79 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </button>
            <button type="button" className="social-btn" disabled={isLoading} aria-label="Sign up with Twitter">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1DA1F2">
                <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733a4.67 4.67 0 0 0 2.048-2.578 9.3 9.3 0 0 1-2.958 1.13 4.66 4.66 0 0 0-7.938 4.25 13.229 13.229 0 0 1-9.602-4.868c-.4.69-.63 1.49-.63 2.342A4.66 4.66 0 0 0 3.96 9.824a4.647 4.647 0 0 1-2.11-.583v.06a4.66 4.66 0 0 0 3.737 4.568 4.692 4.692 0 0 1-2.104.08 4.661 4.661 0 0 0 4.352 3.234 9.348 9.348 0 0 1-5.786 1.995 9.5 9.5 0 0 1-1.112-.065 13.175 13.175 0 0 0 7.14 2.093c8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602a9.47 9.47 0 0 0 2.323-2.41l.002-.003z" />
              </svg>
            </button>
          </div>

          <p className="signup-footer">
            Already have an account?{' '}
            <Link to="/signin" className="signup-link">Sign In</Link>
          </p>
        </div>

        {/* Side Info Panel - Desktop Only */}
        <div className="info-panel">
          <div className="info-content">
            <div className="info-badge">
              <span className="pulse-dot"></span>
              <span>Join 10,000+ Users</span>
            </div>
            <h1 className="info-title">
              Start Your Journey<br />
              <span className="gradient-text">With SuperAssist</span>
            </h1>
            <p className="info-description">
              Create your account in seconds and unlock the power of AI-driven assistance for all your daily tasks.
            </p>
            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon feature-icon-purple">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                </div>
                <div>
                  <div className="feature-title">Lightning Fast</div>
                  <div className="feature-desc">Get answers in milliseconds</div>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon feature-icon-pink">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                  </svg>
                </div>
                <div>
                  <div className="feature-title">Multi-Layered AI</div>
                  <div className="feature-desc">Advanced neural processing</div>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon feature-icon-blue">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <div>
                  <div className="feature-title">Bank-Grade Security</div>
                  <div className="feature-desc">Your data stays protected</div>
                </div>
              </div>
            </div>
            <div className="stats-row">
              <div className="stat-item">
                <div className="stat-value">10K+</div>
                <div className="stat-label">Active Users</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-value">99.9%</div>
                <div className="stat-label">Uptime</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-value">4.9★</div>
                <div className="stat-label">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp