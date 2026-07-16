// Protection.jsx - SAME AS YOUR ORIGINAL CODE
import React, { useEffect } from 'react';
import { useGetMeQuery } from '../../redux/api/authApi';
import { useDispatch } from 'react-redux';
import "./Protection.css"

export default function Protection({ children }) {
  
  const { data, isLoading, isError } = useGetMeQuery();
  const dispatch = useDispatch();

  async function checkUser() {
    try {
      setLoading(true);
      const data = await getMe();
      
      // Check karo ki data aur data.data exist karta hai
      if (data && data.data) {
        dispatch(getUser(data.data));
        setUser(data.data);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null); // User ko null hi rakho agar error aaya
    } finally {
      setLoading(false); // Ye block har haal me chalega
    }
  }

  useEffect(() => {
    checkUser();
  }, [dispatch])

  if (isLoading) {
    return <div className="auth-loading-screen">
      <div className="auth-loader-container">
        <div className="auth-spinner">
          <div className="auth-spinner-ring"></div>
          <div className="auth-spinner-ring"></div>
          <div className="auth-spinner-ring"></div>
        </div>
        <h2 className="auth-loading-text">Authenticating<span className="auth-dots"></span></h2>
        <p className="auth-loading-subtext">Verifying your secure session...</p>
      </div>
    </div>;
  }

  // Agar error aaya (401) ya data null hai
  if (isError || !data) {
    return (
      <div className="auth-unauthorized-screen">
        <div className="auth-unauthorized-card">
          <div className="auth-shield-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
            </svg>
          </div>
          <h1 className="auth-error-title">Access Denied</h1>
          <h2 className="auth-error-subtitle">Unauthorized User</h2>
          <p className="auth-error-description">
            Your session has expired or you don't have permission to access this area. 
            Please sign in to continue your journey.
          </p>
          <a href="/signin" className="auth-login-button">
            <span>Sign In to Continue</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
          <a href="/" className="auth-back-home">← Back to homepage</a>
        </div>
        <div className="auth-bg-blob auth-blob-1"></div>
        <div className="auth-bg-blob auth-blob-2"></div>
        <div className="auth-bg-blob auth-blob-3"></div>
      </div>
    );
  }

  // Agar user mil gaya toh children render karo
  return children;
}
