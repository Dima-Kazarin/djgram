import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, SafeAreaView, Image, FlatList, RefreshControl } from 'react-native';
import TokenStorage from '../src/services/api/JwtToken';
import styles from '../src/styles';
import { useGetCountFollowersQuery, useGetCountFollowingQuery, useGetCountPostsQuery, useGetFollowUserQuery, useGetPostQuery, useGetUserByIdQuery, useGetUserPostsQuery, useLoginUserMutation, useSubscribeMutation, useUnsubscribeMutation } from '../src/services/api/api';
import BottomNav from './BottomNav';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Header from './Header';
import { StatusBar, Platform } from 'react-native';

interface ProfileProps {
    navigation: StackNavigationProp<any, any>
}

const ProfileScreen = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [userId, setUserId] = useState<number | null>(null)
    const [profileId, setProfileId] = useState<number | null>(null)
    const [loginUser, { isLoading, isError }] = useLoginUserMutation()
    const [subscribe] = useSubscribeMutation()
    const [unsubscribe] = useUnsubscribeMutation()

    const route = useRoute()
    const navigation = useNavigation<ProfileProps>()

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

    const checkAuthorization = async () => {
        const token = await TokenStorage.getToken()
        if (token) {
            setIsAuthorized(true)

        } else {
            setIsAuthorized(false)
        }
    }

    useEffect(() => {
        checkAuthorization()
    }, [])

    const { data: posts, refetch: postsRefetch, isFetching: postsFetching } = useGetUserPostsQuery(currentProfileId ?? 0, { skip: currentProfileId === null })
    const { data: count_posts, refetch: countRefetch, isFetching: countFetching } = useGetCountPostsQuery(currentProfileId ?? 0)
    const { data: count_followers, refetch: followersRefetch, isFetching: followersFetching } = useGetCountFollowersQuery(currentProfileId ?? 0)
    const { data: count_following, refetch: followingRefetch, isFetching: followingFetching } = useGetCountFollowingQuery(currentProfileId ?? 0)
    const { data: follow, refetch: followRefetch, isFetching: followFetching } = useGetFollowUserQuery({ followerId: userId ?? 0, followedId: profileId ?? 0 })

    const handleRefresh = async () => {
        await Promise.all([postsRefetch(), countRefetch(), followersRefetch(), followingRefetch(), followRefetch()])
    }

    useFocusEffect(
        useCallback(() => {
            if (currentProfileId !== null) {
                handleRefresh()
            }
        }, [currentProfileId, countRefetch])
    )

    return (
        <SafeAreaView style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, flex: 1 }}>
            <Header />
            {isAuthorized ? (
                <SafeAreaView>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.userdata}>{currentProfileId}</Text>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Text>{count_posts?.posts_count}</Text>
                            <Text>posts</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('Follow', { followedId: currentProfileId })}>
                            <View style={{ justifyContent: 'center', alignItems: 'center', marginLeft: 10 }}>
                                <Text>{count_followers?.followers_count}</Text>
                                <Text>followers</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('Follow', { followerId: currentProfileId })}>
                            <View style={{ justifyContent: 'center', alignItems: 'center', marginLeft: 10 }}>
                                <Text>{count_following?.following_count}</Text>
                                <Text>subscriptions</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ justifyContent: 'center', alignItems: 'center', paddingBottom: 40, paddingTop: 10 }}>
                        {userId === profileId ? (
                            <TouchableOpacity style={[styles.subscribe_button, { backgroundColor: 'gray' }]}>
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
                            <FlatList style={{ height: '84%' }} data={posts} renderItem={({ item }) => (
                                <TouchableOpacity style={styles.scroll_profile} onPress={() => navigation.navigate('PostDetail', { ...item })}>
                                    <Image source={{ uri: `http://192.168.1.4:8000${item.image}` }} style={{ width: 100, height: 100 }} />
                                </TouchableOpacity>
                            )}
                                keyExtractor={(item) => item.id.toString()}
                                refreshControl={
                                    <RefreshControl refreshing={postsFetching || countFetching || followersFetching || followingFetching || followFetching} onRefresh={handleRefresh} />
                                }
                                numColumns={3}
                            />
                        ) : (
                            <Text style={{ height: '89%' }}>No posts</Text>
                        )}
                        <View style={{ paddingTop: 23 }}>
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