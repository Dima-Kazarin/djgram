import React, { useCallback, useEffect, useState } from 'react';
import { Image, Text, View, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import TokenStorage from '../src/services/api/JwtToken';
import styles from '../src/styles';
import { useAddLikeMutation, useGetAllPostsQuery, useGetLikedPostsByUserQuery, useGetUserQuery, useRemoveLikeMutation } from '../src/services/api/api';
import Header from './Header';
import BottomNav from './BottomNav';
import { useFocusEffect } from '@react-navigation/native';

interface User {
    id: string | number
    username: string
}

const HomeScreen = () => {
    const [likedPosts, setLikedPosts] = useState<{ [key: number]: number | null }>({})
    const [likeCounts, setLikeCounts] = useState<{ [key: number]: number }>({})
    const [userId, setUserId] = useState<number | null>(null)
    const [socket, setSocket] = useState<{ [key: number]: WebSocket }>({})

    const { data: posts, refetch: refetchPosts, isFetching: postsFetching } = useGetAllPostsQuery()
    const { data: users, refetch: refetchUsers, isFetching: usersFetching } = useGetUserQuery()
    const [addLike, { isLoading, error }] = useAddLikeMutation()
    const [removeLike] = useRemoveLikeMutation()
    const { data: likedPostsData, refetch: refetchLikedPosts } = useGetLikedPostsByUserQuery(userId ?? 0, { skip: userId === null })

    const users_dict = (users || []).reduce<{ [key: string]: string }>((acc, item: User) => {
        acc[item.id] = item.username
        return acc
    }, {})

    useEffect(() => {
        const fetchUserId = async () => {
            const id = await TokenStorage.getUserId()

            if (id !== null && id != undefined) {
                setUserId(id)
            }
        }
        fetchUserId()

    }, [refetchPosts])

    useEffect(() => {
        if (likedPostsData) {
            const likedMap = likedPostsData.reduce<{ [key: number]: number | null }>((acc, { post, id }) => {
                acc[post] = id
                return acc
            }, {})
            setLikedPosts(likedMap)
        }
    }, [likedPostsData])

    const createSocketForPost = (postId: number) => {
        if (!socket[postId]) {
            const socketInstance = new WebSocket(`ws://192.168.1.5:8000/ws/likes/${postId}`)
            socketInstance.onmessage = (event) => {
                const data = JSON.parse(event.data)
                const { post_id, like_count } = data
                setLikeCounts((prevState) => ({
                    ...prevState,
                    [post_id]: like_count,
                }))
            }

            socketInstance.onclose = () => {
                console.log('Websocket connection closed')
            }

            setSocket((prevState: any) => ({
                ...prevState,
                [postId]: socketInstance,
            }))
        }
    }

    const disconnectSocketForPosts = () => {
        Object.keys(socket).forEach((postId: any) => {
            socket[postId].close()
            console.log(`Disconnected socket for post ${postId}`)
        })
    }

    const handleRefresh = async () => {
        await Promise.all([refetchPosts(), refetchUsers(), refetchLikedPosts()])
    }

    const handleLike = async (post: number) => {
        const likeId = likedPosts[post]

        try {
            if (likeId) {
                await removeLike(likeId).unwrap()
                setLikedPosts((prevState) => ({
                    ...prevState,
                    [post]: null,
                }))

                socket[post].send(JSON.stringify({ type: 'like_removed', post_id: post, like_count: likeCounts[post] - 1 }))
            } else {
                const response = await addLike({ post }).unwrap()
                setLikedPosts((prevState) => ({
                    ...prevState,
                    [post]: response.id,
                }))

                socket[post].send(JSON.stringify({ type: 'like_added', post_id: post, like_count: likeCounts[post] + 1 }))
            }
        } catch (error) {
            console.error("Error adding like:", error)

            setLikedPosts((prevState) => ({
                ...prevState,
                [post]: likeId,
            }))
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString()
    }

    useEffect(() => {
        posts?.forEach((post) => {
            createSocketForPost(post.id)
        })
    }, [posts])

    useFocusEffect(
        useCallback(() => {
            if (userId !== null) {
                handleRefresh()
                refetchLikedPosts()
                console.log('asdjaijshduiashdiua')
            }
        }, [userId, refetchLikedPosts])
    )

    return (
        <View>
            <Header disconnectPostSockets={disconnectSocketForPosts} />
            {!posts ? (
                <Text style={{ textAlign: 'center', marginTop: 20 }}>You must be logged in to see posts</Text>
            ) : posts && posts.length === 0 ? (
                <Text style={{ textAlign: 'center', marginTop: 20 }}>No posts available</Text>
            ) : <FlatList style={{ marginBottom: 110 }} data={posts} renderItem={({ item }) => (
                <View style={styles.scroll}>
                    <Text style={{ fontWeight: 'bold', paddingLeft: 10 }}>{users_dict[item.author]}</Text>
                    <Image source={{ uri: `http://192.168.1.5:8000${item.image}` }} resizeMode='cover' style={{ width: '100%', height: 400 }} />
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity onPress={() => handleLike(item.id)}>
                            <Image style={{ left: 5, top: 2 }} source={likedPosts[item.id] ? require('../src/static/unlike.png') : require('../src/static/like.png')} />
                        </TouchableOpacity>
                        <Text style={{ paddingLeft: 7, top: 5 }}> {likeCounts[item.id] || item.like_count} </Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', paddingLeft: 10 }}>{users_dict[item.author]}</Text>
                        <Text style={{ paddingLeft: 3 }}> {item.description} </Text>
                    </View>
                    <Text style={{ paddingBottom: 10, paddingLeft: 7 }}> {formatDate(item.created_at)} </Text>
                </View>
            )}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                    <RefreshControl refreshing={postsFetching || usersFetching} onRefresh={handleRefresh} />
                }
            />
            }
            <BottomNav disconnectPostSockets={disconnectSocketForPosts} />
        </View>
    )

}

export default HomeScreen