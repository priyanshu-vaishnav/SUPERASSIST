import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { getMe } from '../../api/auth.api';
import { getUser } from '../../redux/slices/user.slice';

export default function Protection({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()

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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', color: 'red', fontWeight: 'bold', fontSize: '24px' }}>
        Loading....
      </div>
    )
  }

  return user ? (children) : (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', color: 'red', fontWeight: 'bold', fontSize: '24px' }}>
      UNAUTHORIZED USER
      {/* Yahan pe tum SignIn component redirect link bhi daal sakte ho */}
      <a href="/signin" style={{ color: 'blue', fontSize: '16px', marginTop: '10px' }}>Click to Login</a>
    </div>
  )
}