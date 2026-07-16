import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const chatApi = createApi({

    reducerPath: "chatApi",
    baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BASE_URL, credentials: "include" }),

    endpoints: (builder) => ({


        createUserChat: builder.mutation({
            query: () => ({
                url: "chat/api/createchat",
                method: "POST",credentials:"include"
            })
        }),
        deleteUserChat: builder.mutation({
            query: ( {chatId,id}) => ({
                url: "chat/api/deleteSingleChat",
                method: "POST",
                body: { chatId ,id},credentials:"include"

            })
        })
        ,
        fetchUserChat: builder.query({   // mutation nahi, query
            query: () => ({
                url: 'chat/api/fetchchats',
                method: 'GET',credentials:"include"
            }),
        }),
       sendMessage: builder.mutation({
            query: ({ chatId, humanMessage, sfile }) => {
                // 1. FormData ka instance banayein
                const formData = new FormData();
                formData.append('chatId', chatId);
                formData.append('humanMessage', humanMessage);

                // Agar file hai toh use append karein
                if (sfile) {
                    formData.append('file', sfile);
                }else{
                    console.log("")
                }

                return {
                    url: "agent/api/chat",
                    method: "POST",
                    body: formData,
                    formData: true, // Kuch versions mein ye zaruri hai, ya fir:
                    credentials:"include"
                };
            }
        })

    })



})

export const { useCreateUserChatMutation, useFetchUserChatQuery, useSendMessageMutation ,useDeleteUserChatMutation} = chatApi;