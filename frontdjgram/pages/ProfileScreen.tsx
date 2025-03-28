import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, SafeAreaView, Image, FlatList, RefreshControl } from 'react-native';
import TokenStorage from '../src/services/api/JwtToken'
import styles from '../src/styles';
import { useGetUserPostsQuery, useLoginUserMutation } from '../src/services/api/api';

const ProfileScreen = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [loginUser, {isLoading, isError}] = useLoginUserMutation()
    const {data, refetch, isFetching} = useGetUserPostsQuery(3)

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
        }
        catch (error) {
            console.error(error);
        }

    }

    const handleLogout = async () => {
        TokenStorage.removeTokens()
        setIsAuthorized(false)
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

    return (
        <SafeAreaView>
            {isAuthorized ? (
                <View>
                    <Text style={styles.userdata}>Hi, {username}</Text>
                    <TouchableOpacity style={styles.buttons_log} onPress={handleLogout} >
                        <Text style={styles.textButton}>Logout</Text>
                    </TouchableOpacity>

                    {data && data.length > 0 ? (
                        <FlatList data={data} renderItem={({ item }) => (
                            <View style={styles.scroll_profile}>
                                <Text style={{ paddingTop: 10 }}>{item.description} </Text>
                                <Image source={{ uri: `http://192.168.1.2:8000${item.image}` }} style={{ width: 50, height: 50 }} />
                                <Text> {item.created_at} </Text>
                                <Text> {item.like_count} </Text>
                            </View>
                        )}
                            keyExtractor={(item) => item.id.toString()}
                            refreshControl={
                                <RefreshControl refreshing={isFetching} onRefresh={refetch} />
                            }
                            numColumns={3}
                        />
                    ) : (
                        <Text>No posts available</Text>
                    )}
                </View>
            ) : (
                <View style={styles.form}>
                    <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 10 }}>
                        Login
                    </Text>
                    <TextInput placeholder='Enter username' placeholderTextColor="gray" onChangeText={handleChangeUsername} style={styles.input} value={username} />
                    <TextInput placeholder='Enter password' placeholderTextColor="gray" secureTextEntry={true} onChangeText={handleChangePassword} style={styles.input} value={password} />
                    <TouchableOpacity style={styles.buttons_log} onPress={handleSubmit} >
                        <Text style={styles.textButton}>Login</Text>
                    </TouchableOpacity>
                </View>)
            }
        </SafeAreaView>

    );
}

export default ProfileScreen;