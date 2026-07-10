import React, { useState } from 'react'
import { useSignInuserMutation } from '../../redux/api/authApi'
import StatusScreen from '../main/StatusScreen'
import { useNavigate } from 'react-router'
import { useDispatch } from 'react-redux'
import { getUser } from '../../redux/slices/user.slice'
function SignIn() {

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [signInUser, { isLoading, isError, isSuccess, error }] = useSignInuserMutation()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { data, error } = await signInUser({ email: formData.email, password: formData.password })
    if (!error) {
  
      localStorage.setItem("userId",data.user.id)
      dispatch(getUser(data.user.user_metadata))
      navigate("/dashboard")

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
                <h2 className="card-title text-center">Sign In</h2>

                <form onSubmit={handleSubmit}>
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

                  <div className="mb-3 form-check">
                    <input type="checkbox" className="form-check-input" id="rememberMe" />
                    <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                  </div>

                  <button type="submit" className="btn btn-primary w-100">
                    Sign In
                  </button>
                </form>

                <p className="text-center mt-3">
                  Don't have an account? <a href="/signup">Sign Up</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SignIn