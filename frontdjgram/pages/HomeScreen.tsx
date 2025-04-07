import React, { useCallback, useState } from 'react';
import { Text, View, FlatList, RefreshControl } from 'react-native';
import { useGetAllPostsQuery } from '../src/services/api/api';
import Header from './Header';
import BottomNav from './BottomNav';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import PostItem from '../src/helpers/PostItem';
import { SafeAreaView } from 'react-native-safe-area-context';

interface BottomNavProps {
    navigation: StackNavigationProp<any, any>
}

const HomeScreen = () => {
    const navigation = useNavigation<BottomNavProps>()
    const { data: posts, refetch: refetchPosts, isFetching: postsFetching } = useGetAllPostsQuery()
    const [postSockets, setPostSockets] = useState<{ [key: number]: WebSocket }>({})
    const [refetchFuncs, setRefetchFuncs] = useState<{ [key: number]: () => void }>({})
    const [refreshing, setRefreshing] = useState(false)

    const disconnectSocketForPosts = () => {
        if (postSockets) {
            Object.keys(postSockets).forEach((id: any) => {
                postSockets[id]?.[id].close()
                console.log(`Disconnected socket for post ${id}`)
            })
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await refetchPosts()
        setRefreshing(false)
        Object.keys(refetchFuncs).forEach(async (fn: any) => {
            refetchFuncs[fn]()
        })
    }

    useFocusEffect(
        useCallback(() => {
            handleRefresh()
        }, [refetchFuncs])
    )

    return (
        <SafeAreaView>
            <Header disconnectPostSockets={disconnectSocketForPosts} />
            {!posts ? (
                <Text style={{ textAlign: 'center', marginTop: 20 }}>You must be logged in to see posts</Text>
            ) : posts && posts.length === 0 ? (
                <Text style={{ textAlign: 'center', marginTop: 20 }}>No posts available</Text>
            ) : <FlatList
                style={{ marginBottom: 110, height: '85%' }}
                data={posts}
                renderItem={({ item }) => (
                    <PostItem
                        item={item}
                        navigation={navigation}
                        setPostSockets={setPostSockets}
                        setRefetchFuncs={setRefetchFuncs}
                        disconnectPostSockets={disconnectSocketForPosts}
                    />
                )}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            />
            }
            <BottomNav disconnectPostSockets={disconnectSocketForPosts} />
        </SafeAreaView>
    )

}

export default HomeScreen