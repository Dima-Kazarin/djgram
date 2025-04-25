import React, { useEffect, useState } from 'react';
import { SafeAreaView, FlatList, RefreshControl, StatusBar, Platform } from 'react-native';
import { useGetFollowedUserQuery, useGetFollowerUserQuery } from '../src/services/api/api';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import Header from './Header';
import UserItem from '../src/helpers/UserItem';

interface FollowerProps {
    navigation: StackNavigationProp<any, any>
}

type RouteParams = {
    FollowerScreen: {
        followedId?: number
        followerId?: number
    }
}

const FollowerScreen = () => {
    const [followedId, setFollowedId] = useState<number | null>(null)
    const [followerId, setFollowerId] = useState<number | null>(null)
    const route = useRoute<RouteProp<RouteParams, 'FollowerScreen'>>()
    const navigation = useNavigation<FollowerProps>()

    useEffect(() => {
        if (route.params?.followedId) {
            setFollowedId(route.params.followedId)
        }
    }, [route.params?.followedId])

    useEffect(() => {
        if (route.params?.followerId) {
            setFollowerId(route.params.followerId)
        }
    }, [route.params?.followerId])

    const { data: followers, isFetching: followersFetching, refetch: refetchFollowers } = useGetFollowedUserQuery(followedId ?? 0, { skip: !followedId })
    const { data: following, isFetching: followingFetching, refetch: refetchFollowing } = useGetFollowerUserQuery(followerId ?? 0, { skip: !followerId })

    const displayList = followedId ? followers : following

    const handleRefresh = async () => {
        await Promise.all([refetchFollowers(), refetchFollowing()])
    }

    return (
        <SafeAreaView style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, flex: 1 }}>
            <Header />
            <FlatList data={displayList} renderItem={({ item }) => {
                const userId = followedId ? item.follower : item.followed
                return <UserItem userId={userId} navigation={navigation} />
            }}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                    <RefreshControl refreshing={followersFetching || followingFetching} onRefresh={handleRefresh} />
                }
            />
        </SafeAreaView>
    )
}

export default FollowerScreen