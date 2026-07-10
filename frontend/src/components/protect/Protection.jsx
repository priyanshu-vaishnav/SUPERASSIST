import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { getMe } from '../../api/auth.api';
import { getUser } from '../../redux/slices/user.slice';
import SignIn from '../auth/SignIn';

export default function Protection({ children }) {


  const [user, setUser] = useState(null)
  const [loading,setLoading] = useState(true)
  const dispatch = useDispatch()

  async function checkUser() {
    const data = await getMe();
    dispatch(getUser(data.data))
    setUser(data.data)
    setLoading(false)

  }

  useEffect(() => {
    checkUser();

  }, [dispatch])

  if(loading){
    return (<div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    color: 'red',
    fontWeight: 'bold',
    fontSize: '24px'
  }}>
    Loading....
  </div>)
  }



  return user ? (children) : <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    color: 'red',
    fontWeight: 'bold',
    fontSize: '24px'
  }}>
    UNAUTHORIZED USER
  </div>


}
