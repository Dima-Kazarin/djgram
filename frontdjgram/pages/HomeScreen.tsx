import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Text, View, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import TokenStorage from '../src/services/api/JwtToken'
import styles from '../src/styles';
import { useAddLikeMutation, useGetAllPostsQuery, useGetLikedPostsByUserQuery, useGetUserQuery, useRemoveLikeMutation } from '../src/services/api/api';

interface User {
    id: string | number;
    username: string;
}

const HomeScreen = () => {
    const [likedPosts, setLikedPosts] = useState<{ [key: number]: number | null }>({});
    const [userId, setUserId] = useState<number | null>(null)

    const { data: posts, refetch: refetchPosts, isFetching: postsFetching } = useGetAllPostsQuery()
    const { data: users, refetch: refetchUsers, isFetching: usersFetching } = useGetUserQuery();
    const [addLike, { isLoading, error }] = useAddLikeMutation()
    const [removeLike] = useRemoveLikeMutation()
    const { data: likedPostsData, refetch: refetchLikedPosts } = useGetLikedPostsByUserQuery(userId ?? 0, { skip: userId === null })

    const users_dict = (users || []).reduce<{ [key: string]: string }>((acc, item: User) => {
        acc[item.id] = item.username;
        return acc;
    }, {});

    useEffect(() => {
        const fetchUserId = async () => {
            const id = await TokenStorage.getUserId();

            if (id !== null && id != undefined) {
                setUserId(id);
            }
        };
        fetchUserId();
        console.log(userId);

    }, [refetchPosts]);

    useEffect(() => {
        if (likedPostsData) {
            const likedMap = likedPostsData.reduce<{ [key: number]: number | null }>((acc, { post, id }) => {
                acc[post] = id
                return acc
            }, {})
            setLikedPosts(likedMap)
        }
    }, [likedPostsData])

    const handleRefresh = async () => {
        await Promise.all([refetchPosts(), refetchUsers(), refetchLikedPosts()]);
    };

    const handleLike = async (post: number) => {
        const likeId = likedPosts[post]

        try {
            if (likeId) {
                await removeLike(likeId).unwrap()
                setLikedPosts((prevState) => ({
                    ...prevState,
                    [post]: null,
                }));
            } else {
                const response = await addLike({ post }).unwrap();
                setLikedPosts((prevState) => ({
                    ...prevState,
                    [post]: response.id,
                }));

            }
        } catch (error) {
            console.error("Error adding like:", error);

            setLikedPosts((prevState) => ({
                ...prevState,
                [post]: likeId,
            }));
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return (
        <View>
            {!posts ? (
                <Text style={{ textAlign: 'center', marginTop: 20 }}>You must be logged in to see posts</Text>
            ) : posts && posts.length === 0 ? (
                <Text style={{ textAlign: 'center', marginTop: 20 }}>No posts available</Text>
            ) : <FlatList data={posts} renderItem={({ item }) => (
                <View style={styles.scroll}>
                    <Text style={{ fontWeight: 'bold', paddingLeft: 10 }}>{users_dict[item.author]}</Text>
                    <Image source={{ uri: `http://192.168.1.2:8000${item.image}` }} resizeMode='cover' style={{ width: '100%', height: 400 }} />
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity onPress={() => handleLike(item.id)}>
                            <Image style={{ left: 5, top: 2 }} source={likedPosts[item.id] ? require('../src/static/unlike.png') : require('../src/static/like.png')} />
                        </TouchableOpacity>
                        <Text style={{ paddingLeft: 7, top: 5 }}> {item.like_count} </Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', paddingLeft: 10 }}>{users_dict[item.author]}</Text>
                        <Text style={{ paddingLeft: 3 }}> {item.description} </Text>
                    </View>
                    <Text style={{ paddingBottom: 15, paddingLeft: 7 }}> {formatDate(item.created_at)} </Text>
                </View>
            )}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                    <RefreshControl refreshing={postsFetching || usersFetching} onRefresh={handleRefresh} />
                }
            />
            }
        </View>
    );
}

export default HomeScreen;