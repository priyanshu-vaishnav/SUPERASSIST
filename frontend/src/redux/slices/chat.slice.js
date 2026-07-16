import { createSlice } from "@reduxjs/toolkit";

const chat = createSlice({
    name: "chatSlice",
    initialState: {
       
            chatId: null,
            chatMessage: [],
            agent : "chat"
        
    },
    reducers: {
        setChatId: (state, action) => {
            state.chatId = action.payload
        },
        setChatMessages:(state,action)=>{
            state.chatMessage= action.payload
        },
        setAgent : (state,action)=>{
            state.agent = action.payload
        }
    }

})

export const {setChatId,setChatMessages ,setAgent} = chat.actions
export default chat.reducer