import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const chatApi = createApi({

    reducerPath: "chatApi",
    baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BASE_URL, credentials: "include" }),

    endpoints: (builder) => ({


        createUserChat: builder.mutation({
            query: () => ({
                url: "chat/api/createchat",
                method: "POST",
            })
        }),
        deleteUserChat: builder.mutation({
            query: ( {chatId,id}) => ({
                url: "chat/api/deleteSingleChat",
                method: "POST",
                body: { chatId ,id},

            })
        })
        ,
        fetchUserChat: builder.query({   // mutation nahi, query
            query: () => ({
                url: 'chat/api/fetchchats',
                method: 'GET',
            }),
        }),
        sendMessage: builder.mutation({
            query: ({ chatId, humanMessage }) => ({
                url: "chat/api/sendmessage",
                method: "POST",
                body: { chatId, humanMessage },
            })
        })

    })



})

export const { useCreateUserChatMutation, useFetchUserChatQuery, useSendMessageMutation ,useDeleteUserChatMutation} = chatApi;