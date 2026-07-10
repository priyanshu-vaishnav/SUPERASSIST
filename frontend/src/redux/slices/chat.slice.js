import { createSlice } from "@reduxjs/toolkit";

const chat = createSlice({
    name: "chatSlice",
    initialState: {
       
            chatId: null,
            chatMessage: []
        
    },
    reducers: {
        setChatId: (state, action) => {
            state.chatId = action.payload
        },
        setChatMessages:(state,action)=>{
            state.chatMessage= action.payload
        }
    }

})

export const {setChatId,setChatMessages} = chat.actions
export default chat.reducer