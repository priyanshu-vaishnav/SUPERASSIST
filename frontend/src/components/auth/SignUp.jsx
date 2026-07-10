import React, { useState } from 'react'
import { useSignupUserMutation } from '../../redux/api/authApi'
import StatusScreen from '../main/StatusScreen';

function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [signupUser, { isLoading, isError, isSuccess, error }] = useSignupUserMutation();
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await signupUser({
        username: formData.name,
        email: formData.email,
        password: formData.password
      }).unwrap();
    } catch (err) {
      console.error('Signup me dikkat aayi:', err);
    }
  }



  return (
    <>



      {isLoading && <StatusScreen status={true} type="loading" />}
      {isError && <StatusScreen status={true} type="error" message={error?.data?.message} />}
      {isSuccess && <StatusScreen status={true} type="success" />}

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card">
              <div className="card-body">
                <h2 className="card-title text-center">Sign Up</h2>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-100">
                    Sign Up
                  </button>
                </form>

                <p className="text-center mt-3">
                  Already have an account? <a href="/signin">signIn</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  )
}

export default SignUp