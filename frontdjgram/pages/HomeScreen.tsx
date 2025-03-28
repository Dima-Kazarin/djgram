import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Text, View, FlatList, RefreshControl } from 'react-native';
import TokenStorage from '../src/services/api/JwtToken'
import styles from '../src/styles';
import { useGetAllPostsQuery, useGetUserQuery } from '../src/services/api/api';

interface User {
    id: string | number;
    username: string;
}

const HomeScreen = () => {
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    const { data: posts, refetch: refetchPosts, isFetching: postsFetching } = useGetAllPostsQuery()
    const { data: users, refetch: refetchUsers, isFetching: usersFetching} = useGetUserQuery();

    const updateToken = async () => {
        try {
            await TokenStorage.updateToken()
            const newToken = await TokenStorage.getToken()
            setToken(newToken)
        }
        catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        const fetchToken = async () => {
            const fetchedToken = await TokenStorage.getToken();
            setToken(fetchedToken);
        }

        fetchToken();

        const intervalId = setInterval(() => {
            updateToken();
        }, 270000)

        return () => clearInterval(intervalId)
    }, [])

    const users_dict = (users || []).reduce<{ [key: string]: string }>((acc, item: User) => {
        acc[item.id] = item.username;
        return acc;
    }, {});

    const handleRefresh = async () => {
        await Promise.all([refetchPosts(), refetchUsers()]);
    };

    return (
        <View>
            {!token && !posts ? (
                <Text style={{ textAlign: 'center', marginTop: 20 }}>You must be logged in to see posts</Text>
            ) : loading ? (<ActivityIndicator size="large" color="blue" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />
            ) : posts && posts.length === 0 ? (
                <Text style={{ textAlign: 'center', marginTop: 20 }}>No posts available</Text>
            ) : <FlatList data={posts} renderItem={({ item }) => (
                <View style={styles.scroll}>
                    <Text style={{ paddingTop: 10 }}>{item.description} </Text>
                    <Image source={{ uri: `http://192.168.1.2:8000${item.image}` }} style={{ width: 50, height: 50 }} />
                    <Text>{users_dict[item.author]}</Text>
                    <Text> {item.created_at} </Text>
                    <Text> {item.like_count} </Text>
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