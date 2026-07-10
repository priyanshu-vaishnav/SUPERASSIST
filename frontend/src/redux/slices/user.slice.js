import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState : {
        value : null
    },
    reducers: {
        getUser: (state, action) => {

            state.value = action.payload
        }
    }


})

// Export the actions to use in components
export const { getUser } = userSlice.actions;

// Export the reducer to use in the store
export default userSlice.reducer;