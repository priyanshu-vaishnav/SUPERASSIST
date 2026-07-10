import React from 'react'
import { getUser } from '../../redux/slices/user.slice'
import { useSelector } from 'react-redux'
import { getMe } from '../../api/auth.api'
import Sidebar from './Sidebar'
import Chatsection from './Chatsection'



function Dashboard() {
 
  const user = useSelector((state)=>state.user.value)
 
  
  return (
    <>
    <div >
<Sidebar />
<Chatsection/>

    </div>
   </>
  )
}

export default Dashboard


