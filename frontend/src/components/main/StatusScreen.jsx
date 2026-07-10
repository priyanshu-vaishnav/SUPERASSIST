import React from 'react'

// 💡 Props me humne 'type' aur 'message' le liya
function StatusScreen({ type, message }) {
  
  // 1. LOADING STATE
  if (type === 'loading') {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center text-center py-5">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">{message || "Loading, please wait..."}</p>
      </div>
    )
  }

  // 2. ERROR STATE
  if (type === 'error') {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center text-center py-5">
        <h5 className="text-danger mb-2">Something went wrong</h5>
        {/* Backend se aaya hua exact error message dikhane ke liye */}
        <p className="text-muted">{message || "Please try again later."}</p>
      </div>
    )
  }

  // 3. SUCCESS STATE
  if (type === 'success') {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center text-center py-5">
        {/* Ek badhiya thumbs-up ya check icon bhi laga sakte ho bootstrap ka */}
        <h5 className="text-success mb-2">Success!</h5>
        <p className="text-muted">{message || "Your action was completed successfully."}</p>
      </div>
    )
  }

  return null
}

export default StatusScreen