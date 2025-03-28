import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Post, User } from './types'
import TokenStorage from './JwtToken'

export const postApi = createApi({
    reducerPath: 'postApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://192.168.1.2:8000/api/',
        prepareHeaders: async (headers) => {
            const token = await TokenStorage.getToken()
            if (token) {
                headers.set('Authorization', `Bearer ${token}`)
            }
            return headers
        }
    }),
    endpoints: (builder) => ({
        getAllPosts: builder.query<Post[], void>({
            query: () => 'post',
        }),
        getUser: builder.query<User[], void>({
            query: () => 'user'
        }),
        loginUser: builder.mutation({
            query: (credentials) => ({
                url: 'token/',
                method: 'POST',
                body: credentials,
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled
                    TokenStorage.storeToken(data.access, data.refresh)
                } catch (error) {
                    console.error(error)
                }
            }
        }),
        getUserPosts: builder.query<Post[], number>({
            query: (userId) => `post?by_user_id=${userId}`
        }),
        addPost: builder.mutation({
            query: (formData) => ({
                url: 'post/',
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
        })
    }),
})

export const { useGetAllPostsQuery, useGetUserQuery, useLoginUserMutation, useGetUserPostsQuery, useAddPostMutation } = postApi