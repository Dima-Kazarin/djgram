import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Post, User, Like } from './types'
import TokenStorage from './JwtToken'

const baseQuery = fetchBaseQuery({
    baseUrl: 'http://192.168.1.2:8000/api/',
    prepareHeaders: async (headers) => {
        const token = await TokenStorage.getToken();
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    }
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
    let result = await baseQuery(args, api, extraOptions)

    if (result.error && result.error.status === 401) {
        const refreshToken = await TokenStorage.getRefreshToken()

        if (refreshToken) {
            try {
                const refreshResult = await baseQuery(
                    {
                        url: 'token/refresh/',
                        method: 'POST',
                        body: { refresh: refreshToken }
                    },
                    api,
                    extraOptions
                )

                if (refreshResult.data) {
                    const newAccessToken = refreshResult.data.access
                    await TokenStorage.storeToken(newAccessToken, refreshToken)

                    result = await baseQuery(args, api, extraOptions)
                } else {
                    console.error('Error updating token')
                }
            } catch (error) {
                console.error('Error refreshing token', error)
            }
        }
    }
    return result
}

export const postApi = createApi({
    reducerPath: 'postApi',
    baseQuery: baseQueryWithReauth,
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
        getPost: builder.query<Post[], number>({
            query: (postId) => `post?by_post_id=${postId}`
        }),
        addPost: builder.mutation({
            query: (formData) => ({
                url: 'post/',
                method: 'POST',
                body: formData,
            })
        }),
        addLike: builder.mutation({
            query: (data) => ({
                url: 'like/',
                method: 'POST',
                body: data,
            })
        }),
        removeLike: builder.mutation({
            query: (likeId) => ({
                url: `like/${likeId}/`,
                method: 'DELETE'
            })
        }),
        getLikedPostsByUser: builder.query<{post: number, id: number}[], number>({
            query: (userId) => `like/?by_user_id=${userId}`
        })
    }),
})

export const { useGetAllPostsQuery, useGetUserQuery, useLoginUserMutation, useGetUserPostsQuery, useAddPostMutation, useAddLikeMutation, useRemoveLikeMutation, useGetLikedPostsByUserQuery, useGetPostQuery } = postApi