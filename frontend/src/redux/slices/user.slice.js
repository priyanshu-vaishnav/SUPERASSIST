import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState : {
        value : null,
        token : 0,
    },
    reducers: {
        getUser: (state, action) => {

            state.value = action.payload
        },
        getToken :(state,action)=>{
            state.token = action.payload
        }
    }


})

// Export the actions to use in components
export const { getUser,getToken } = userSlice.actions;

// Export the reducer to use in the store
export default userSlice.reducer;