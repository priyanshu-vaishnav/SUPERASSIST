import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const authApi = createApi({

    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BASE_URL ,credentials:"include"}),
    
    endpoints: (builder) => ({


        signupUser: builder.mutation({
            query: ({ username, email, password }) => ({
                url: "auth/api/signup",
                method: "POST",
                body: { username, email, password },
                credentials:"include"
            })
        }),
        // 2. LOGIN: Isko bhi aise hi jodh diya
        signInuser: builder.mutation({
            query: ({ email, password }) => ({
                url: 'auth/api/signin',
                method: 'POST',
                body: { email, password },
                credentials:"include"
            }),
        }),
        signOutUser: builder.mutation({
            query: () => ({
                url:'auth/api/signout',
                method: 'POST',
                credentials:"include"

            }),
        }),
    }
    )



})

export const {useSignupUserMutation,useSignInuserMutation,useSignOutUserMutation} = authApi;