import { createSlice } from "@reduxjs/toolkit";

const chat = createSlice({
    name: "chatSlice",
    initialState: {
        chat: {
            chatId: null,
            chatMessage: []
        }
    },
    reducers: {
        setChatId: (state, action) => {
            state.chat.chatId = action.payload
        },
        setChatMessages:(state,action)=>{
            state.chat.chatMessage.push(action.payload)
        }
    }

})

export const {setChatId,setChatMessages} = chat.actions
export default chat.reducer