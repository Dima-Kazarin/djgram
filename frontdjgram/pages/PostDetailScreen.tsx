import React, { useCallback, useState } from 'react';
import { Platform, RefreshControl, SafeAreaView, StatusBar } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import Header from './Header';
import PostItem from '../src/helpers/PostItem';
import { StackNavigationProp } from '@react-navigation/stack';

interface BottomNavProps {
    navigation: StackNavigationProp<any, any>
}

const PostDetailScreen = () => {
    const navigation = useNavigation<BottomNavProps>()
    const [postSockets, setPostSockets] = useState<{ [key: number]: WebSocket }>({})
    const [refetchFuncs, setRefetchFuncs] = useState<{ [key: number]: () => void }>({})
    const route = useRoute()
    const { id, image, description, created_at, author, like_count } = route.params
    const [refreshing, setRefreshing] = useState(false)

    const handleRefresh = async () => {
        setRefreshing(true)
        Object.keys(refetchFuncs).forEach(async (fn: any) => {
            refetchFuncs[fn]()
        })
        setRefreshing(false)
    }

    const disconnectSocketForPosts = () => {
        if (postSockets) {
            Object.keys(postSockets).forEach((id: any) => {
                postSockets[id]?.[id].close()
                console.log(`Disconnected socket for post ${id}`)
            })
        }
    }

    useFocusEffect(
        useCallback(() => {
            handleRefresh()
        }, [refetchFuncs])
    )

    return (
        <SafeAreaView style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, flex: 1 }}>
            <Header disconnectPostSockets={disconnectSocketForPosts} />
            <ScrollView refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }>
                <PostItem
                    item={{ 'id': id, 'image': image, 'description': description, 'created_at': created_at, 'author': author, 'like_count': like_count }}
                    navigation={navigation}
                    setPostSockets={setPostSockets}
                    setRefetchFuncs={setRefetchFuncs}
                    disconnectPostSockets={disconnectSocketForPosts}
                />
            </ScrollView>
        </SafeAreaView>
    )
}

export default PostDetailScreen