import { createBrowserRouter } from "react-router"
import SignUp from "../components/auth/SignUp"
import SignIn from "../components/auth/SignIn"
import Protection from "../components/protect/Protection"
import Dashboard from "../components/main/Dashboard"

const route = createBrowserRouter([
    {
        path:"/dashboard",
        element:(<Protection>
             <Dashboard/>
        </Protection>)
    },
    {
        path: "/signup",
        element: <SignUp />
    }, 
    {
        path: "/signin",
        element: <SignIn />
    }
    
])

export default route