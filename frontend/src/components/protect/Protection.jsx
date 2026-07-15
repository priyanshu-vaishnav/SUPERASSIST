import React, { useEffect } from 'react';

import { useGetMeQuery } from '../../redux/api/authApi';
import { useDispatch } from 'react-redux';


export default function Protection({ children }) {
  // RTK Query hook call karo (isne andar hi `credentials: "include"` set kar rakha hai)
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
    return <div style={{ color: 'red', fontWeight: 'bold', fontSize: '24px', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading....</div>;
  }

  // Agar error aaya (401) ya data null hai
  if (isError || !data) {
    return (
      <div style={{ color: 'red', fontWeight: 'bold', fontSize: '24px', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        UNAUTHORIZED USER
        <a href="/signin" style={{ fontSize: '16px', color: 'blue', marginTop: '10px' }}>Click to Login</a>
      </div>
    );
  }

  // Agar user mil gaya toh children render karo
  return children;
}