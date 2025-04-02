import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, SafeAreaView, Image, FlatList, RefreshControl } from 'react-native';
import TokenStorage from '../src/services/api/JwtToken';
import styles from '../src/styles';
import { useGetPostQuery, useGetUserPostsQuery, useLoginUserMutation } from '../src/services/api/api';
import BottomNav from './BottomNav';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
    Registration: undefined
}

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Registration'>

interface ProfileScreenProps {
    navigation: ProfileScreenNavigationProp
}


const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [userId, setUserId] = useState<number | null>(null)
    const [loginUser, { isLoading, isError }] = useLoginUserMutation()

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

    const handleLogout = async () => {
        TokenStorage.removeTokens()
        setIsAuthorized(false)
        setUserId(null)
    }

    const checkAuthorization = async () => {
        const token = await TokenStorage.getToken()
        if (token) {
            setIsAuthorized(true)

        } else {
            setIsAuthorized(false)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString()
    }

    useEffect(() => {
        checkAuthorization()
    }, [])

    const { data, refetch, isFetching } = useGetUserPostsQuery(userId ?? 0, { skip: userId === null })

    return (
        <SafeAreaView>
            {isAuthorized ? (
                <View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.userdata}>Hi, {username}</Text>
                        <TouchableOpacity style={styles.buttons_logout} onPress={handleLogout} >
                            <Text style={styles.textButton}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                    <View>
                        {data && data.length > 0 ? (
                            <FlatList style={{ height: '94%' }} data={data} renderItem={({ item }) => (
                                <TouchableOpacity style={styles.scroll_profile}>
                                    <Image source={{ uri: `http://192.168.1.5:8000${item.image}` }} style={{ width: 100, height: 100 }} />
                                </TouchableOpacity>
                            )}
                                keyExtractor={(item) => item.id.toString()}
                                refreshControl={
                                    <RefreshControl refreshing={isFetching} onRefresh={refetch} />
                                }
                                numColumns={3}
                            />
                        ) : (
                            <Text style={{ height: '94%' }}>No posts</Text>
                        )}
                        <View style={{ paddingTop: 23 }}>
                            <BottomNav />
                        </View>
                    </View>
                </View>
            ) : (

                <View>
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
                    <View style={{ paddingTop: 15 }}>
                        <BottomNav />
                    </View>
                </View>
            )}
        </SafeAreaView>

    )
}

export default ProfileScreen