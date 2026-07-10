
import axios from "axios";


const axiosIns = axios.create({
    baseURL: "http://localhost:3000",
    headers: { 'Content-Type': 'application/json' }
})


async function signUp({ username, email, password }) {

    try {
        const user = axiosIns.post('/auth/api/signup', { username, email, password })
        return user;
    } catch (err) {
        return err
    }

}


async function signIn({ email, password }) {

    try {
        const user = axiosIns.post('/auth/api/signin', { email, password })
        return user;
    } catch (err) {
        return err
    }


}

async function getMe() {

    try {
        const user = await axiosIns.get("/auth/api/getme",{withCredentials:true})
        return user
    } catch (err) {
        return err
    }

}

async function signOut() {
    await axiosIns.post("/auth/api/signout")

}

export { signUp, getMe, signOut, signIn }