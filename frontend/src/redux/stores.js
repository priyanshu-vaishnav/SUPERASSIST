import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/user.slice.js"; // Standard name 'userReducer'
import chatReducer from "./slices/chat.slice.js"
import { authApi } from "./api/authApi.js";
import {chatApi} from "./api/chatApi.js"

export const store = configureStore({
    reducer: {
        // 1. RTK Query Reducer
        [authApi.reducerPath]: authApi.reducer,
        [chatApi.reducerPath]:chatApi.reducer,
        
        // 2. Custom User Slice Reducer (Badal kar 'user' kar diya)
        user: userReducer ,
        chat:chatReducer
    },

    // Middleware setup ekdum perfect hai tumhara!
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware().concat(authApi.middleware,chatApi.middleware)

});