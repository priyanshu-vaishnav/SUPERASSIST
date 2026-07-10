import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { getMe } from '../../api/auth.api';
import { getUser } from '../../redux/slices/user.slice';
import SignIn from '../auth/SignIn';

export default function Protection({ children }) {


  const [user, setUser] = useState(null)
  const dispatch = useDispatch()

  async function checkUser() {
    const data = await getMe();
    dispatch(getUser(data.data))
    setUser(data.data)

  }

  useEffect(() => {
    checkUser();

  }, [dispatch])


  return user ? (children) : <div></div>


}
