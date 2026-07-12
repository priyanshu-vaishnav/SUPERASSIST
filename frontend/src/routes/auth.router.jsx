import { createBrowserRouter } from "react-router"
import SignUp from "../components/auth/SignUp"
import SignIn from "../components/auth/SignIn"
import Protection from "../components/protect/Protection"
import Dashboard from "../components/main/Dashboard"
import Setting from "../components/settings/Setting"

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
    },{
        path:'/settings',
        element:
        (<Protection>

            <Setting/>
        </Protection>)
    }
    
])

export default route