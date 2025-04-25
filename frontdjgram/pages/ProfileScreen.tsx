import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, SafeAreaView, Image, FlatList, RefreshControl } from 'react-native';
import TokenStorage from '../src/services/api/JwtToken';
import styles from '../src/styles';
import { useGetCountFollowersQuery, useGetCountFollowingQuery, useGetCountPostsQuery, useGetFollowUserQuery, useGetUserByIdQuery, useGetUserPostsQuery, useLoginUserMutation, useSubscribeMutation, useUnsubscribeMutation } from '../src/services/api/api';
import BottomNav from './BottomNav';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Header from './Header';
import { StatusBar, Platform } from 'react-native';

type RouteParams = {
    ProfileScreen: {
        isAuth?: boolean
        profileId?: number
    }
}

const ProfileScreen = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [isLoadingAuth, setIsLoadingAuth] = useState(true)
    const [userId, setUserId] = useState<number | null>(null)
    const [profileId, setProfileId] = useState<number | null>(null)
    const [loginUser] = useLoginUserMutation()
    const [subscribe] = useSubscribeMutation()
    const [unsubscribe] = useUnsubscribeMutation()

    const route = useRoute<RouteProp<RouteParams, 'ProfileScreen'>>()
    const navigation = useNavigation<StackNavigationProp<any, any>>()

    useEffect(() => {
        if (route.params?.isAuth) {
            setIsAuthorized(route.params.isAuth)
        }
    }, [route.params?.isAuth])

    useEffect(() => {
        if (route.params?.profileId) {
            setProfileId(route.params.profileId)
        } else if (userId) {
            setProfileId(userId)
        }
    }, [route.params?.profileId, userId])

    const currentProfileId = profileId ? profileId : userId

    useEffect(() => {
        const fetchUserId = async () => {
            const id = await TokenStorage.getUserId()

            if (id !== null && id != undefined) {
                setUserId(id)
            }
        }
        fetchUserId()

    }, [isAuthorized])

    const handleChangeUsername = (text: string) => {
        setUsername(text)
    }

    const handleChangePassword = (text: string) => {
        setPassword(text)
    }

    const handleSubmit = async () => {
        try {
            const data = {
                username,
                password
            }
            await loginUser(data).unwrap()
            setIsAuthorized(true)
            setUsername('')
            setPassword('')
        }
        catch (error) {
            console.error(error)
        }

    }

    const handleSubscribe = async () => {
        try {
            const data = {
                'followed': profileId
            }
            await subscribe(data).unwrap()
            handleRefresh()
        } catch (error) {
            console.log(`Error subscribing - ${error}`)
        }
    }

    const handleUnsubscribe = async () => {
        try {
            if (userId === null || profileId === null) {
                throw new Error("Invalid userId or profileId");
            }

            const data = {
                'followerId': userId,
                'followedId': profileId
            }
            await unsubscribe(data).unwrap()
            handleRefresh()
        } catch (error) {
            console.log(`Error unsubscribe - ${error}`)
        }
    }

    const handleEditProfile = () => {
        navigation.navigate('EditProfile', { 'userId': userId })
    }

    useEffect(() => {
        const checkAuthorization = async () => {
            const token = await TokenStorage.getToken()
            setIsAuthorized(!!token)
            setIsLoadingAuth(false)
        }

        checkAuthorization()
    }, [])

    const { data: posts, refetch: postsRefetch, isFetching: postsFetching } = useGetUserPostsQuery(currentProfileId ?? 0, { skip: currentProfileId === null })
    const { data: count_posts, refetch: countRefetch, isFetching: countFetching } = useGetCountPostsQuery(currentProfileId ?? 0)
    const { data: count_followers, refetch: followersRefetch, isFetching: followersFetching } = useGetCountFollowersQuery(currentProfileId ?? 0)
    const { data: count_following, refetch: followingRefetch, isFetching: followingFetching } = useGetCountFollowingQuery(currentProfileId ?? 0)
    const { data: follow, refetch: followRefetch, isFetching: followFetching } = useGetFollowUserQuery({ followerId: userId ?? 0, followedId: profileId ?? 0 })
    const { data: user, refetch: userRefetch, isFetching: userFetching } = useGetUserByIdQuery(currentProfileId ?? 0)

    const handleRefresh = async () => {
        await Promise.all([postsRefetch(), userRefetch(), countRefetch(), followersRefetch(), followingRefetch(), followRefetch()])
    }

    useFocusEffect(
        useCallback(() => {
            if (currentProfileId !== null) {
                handleRefresh()
            }
        }, [currentProfileId])
    )

    return (
        <SafeAreaView style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, flex: 1 }}>
            <Header />
            {isLoadingAuth ? (
                <View></View>
            ) : isAuthorized ? (
                <SafeAreaView>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ width: 80 }}>
                            <Image source={{ uri: `http://192.168.1.5:8000${user?.[0]?.icon}` }} resizeMode='cover' style={styles.user_icon} />
                        </View>
                        <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                            <View style={{ justifyContent: 'center', alignItems: 'center', marginLeft: 60, marginBottom: 30 }}>
                                <Text style={{ paddingBottom: 10, fontSize: 16, fontWeight: 'bold' }}>{user?.[0]?.username}</Text>
                                <Text>{count_posts?.posts_count}</Text>
                                <Text>posts</Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('Follow', { followedId: currentProfileId })}>
                                <View style={{ justifyContent: 'center', alignItems: 'center', marginLeft: 20 }}>
                                    <Text>{count_followers?.followers_count}</Text>
                                    <Text>followers</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigation.navigate('Follow', { followerId: currentProfileId })}>
                                <View style={{ justifyContent: 'center', alignItems: 'center', marginLeft: 20 }}>
                                    <Text>{count_following?.following_count}</Text>
                                    <Text>subscriptions</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ justifyContent: 'center', alignItems: 'center', paddingBottom: 40, paddingTop: 10 }}>
                        {userId === profileId ? (
                            <TouchableOpacity onPress={handleEditProfile} style={[styles.subscribe_button, { backgroundColor: 'gray' }]}>
                                <Text style={{ color: '#fff' }}>Edit profile</Text>
                            </TouchableOpacity>
                        ) : follow?.length === 0 && userId !== profileId ? (
                            <TouchableOpacity style={styles.subscribe_button} onPress={handleSubscribe}>
                                <Text style={{ color: '#fff' }}>Subscribe</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={[styles.subscribe_button, { backgroundColor: 'gray' }]} onPress={handleUnsubscribe}>
                                <Text style={{ color: '#fff' }}>Unsubscribe</Text>
                            </TouchableOpacity>
                        )
                        }
                    </View>
                    <View>
                        {posts && posts.length > 0 ? (
                            <FlatList style={{ height: '74%' }} data={posts} renderItem={({ item }) => (
                                <TouchableOpacity style={styles.scroll_profile} onPress={() => navigation.navigate('PostDetail', { ...item })}>
                                    <Image source={{ uri: `http://192.168.1.5:8000${item.image}` }} style={{ width: 100, height: 100 }} />
                                </TouchableOpacity>
                            )}
                                keyExtractor={(item) => item.id.toString()}
                                refreshControl={
                                    <RefreshControl refreshing={postsFetching || userFetching || countFetching || followersFetching || followingFetching || followFetching} onRefresh={handleRefresh} />
                                }
                                numColumns={3}
                            />
                        ) : (
                            <View style={{ height: '82%' }}></View>
                        )}
                        <View style={{ bottom: 55 }}>
                            <BottomNav />
                        </View>
                    </View>
                </SafeAreaView>
            ) : (
                <View style={{ flex: 1 }}>
                    <View style={styles.form}>
                        <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 10 }}>
                            Login
                        </Text>
                        <TextInput placeholder='Enter username' placeholderTextColor="gray" onChangeText={handleChangeUsername} style={styles.input} value={username} />
                        <TextInput placeholder='Enter password' placeholderTextColor="gray" secureTextEntry={true} onChangeText={handleChangePassword} style={styles.input} value={password} />
                        <TouchableOpacity style={styles.buttons_log} onPress={handleSubmit} >
                            <Text style={styles.textButton}>Login</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.buttons_log, { width: 100 }]} onPress={() => navigation.navigate('Registration')} >
                            <Text style={[styles.textButton, { fontSize: 16 }]}>Register</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ bottom: 15 }}>
                        <BottomNav />
                    </View>
                </View>
            )}
        </SafeAreaView>

    )
}

export default ProfileScreen