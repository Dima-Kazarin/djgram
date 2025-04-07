import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, SafeAreaView, Image, FlatList, RefreshControl } from 'react-native';
import TokenStorage from '../src/services/api/JwtToken';
import styles from '../src/styles';
import { useGetCountFollowersQuery, useGetCountFollowingQuery, useGetCountPostsQuery, useGetFollowedUserQuery, useGetFollowerUserQuery, useGetFollowUserQuery, useGetPostQuery, useGetUserByIdQuery, useGetUserPostsQuery, useGetUserQuery, useLoginUserMutation, useSubscribeMutation, useUnsubscribeMutation } from '../src/services/api/api';
import BottomNav from './BottomNav';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Header from './Header';
import { StatusBar, Platform } from 'react-native';
import { User } from '../src/services/api/types';

interface FollowerProps {
    navigation: StackNavigationProp<any, any>
}

const FollowerScreen = () => {
    const [followedId, setFollowedId] = useState<number | null>(null)
    const [followerId, setFollowerId] = useState<number | null>(null)
    const { data: users, isFetching: usersFetching, refetch: refetchUsers } = useGetUserQuery()
    const route = useRoute()
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

    const users_dict = (users || []).reduce<{ [key: string]: string }>((acc, item: User) => {
        acc[item.id] = item.username
        return acc
    }, {})

    const { data: followers, isFetching: followersFetching, refetch: refetchFollowers } = useGetFollowedUserQuery(followedId, { skip: !followedId })
    const { data: following, isFetching: followingFetching, refetch: refetchFollowing } = useGetFollowerUserQuery(followerId, { skip: !followerId })

    const displayList = followedId ? followers : following

    const handleRefresh = async () => {
        await Promise.all([refetchFollowers(), refetchFollowing(), refetchUsers()])
    }

    return (
        <SafeAreaView style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, flex: 1 }}>
            <Header />
            <FlatList data={displayList} renderItem={({ item }) => (
                <TouchableOpacity
                    style={{ paddingBottom: 5 }}
                    onPress={() =>
                        navigation.navigate('Profile', {
                            profileId: followedId ? item?.follower : item?.followed,
                        })
                    }>
                    <Text>
                        {users_dict[followedId ? item?.follower : item?.followed] || 'Loading...'}
                    </Text>
                </TouchableOpacity>
            )}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                    <RefreshControl refreshing={followersFetching || followingFetching || usersFetching} onRefresh={handleRefresh} />
                }
            />
        </SafeAreaView>

    )
}

export default FollowerScreen