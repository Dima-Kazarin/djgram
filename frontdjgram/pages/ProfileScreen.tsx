import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, SafeAreaView, Image, FlatList, RefreshControl } from 'react-native';
import TokenStorage from '../src/services/api/JwtToken'
import styles from '../src/styles';
import { useGetPostQuery, useGetUserPostsQuery, useLoginUserMutation } from '../src/services/api/api';

const ProfileScreen = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [userId, setUserId] = useState<number | null>(null)
    const [loginUser, { isLoading, isError }] = useLoginUserMutation()

    useEffect(() => {
        const fetchUserId = async () => {
            const id = await TokenStorage.getUserId();

            if (id !== null && id != undefined) {
                setUserId(id);
            }
        };
        fetchUserId();
        console.log(userId);

    }, [isAuthorized]);

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
        const date = new Date(dateString);
        return date.toLocaleString();
    };

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

                    {data && data.length > 0 ? (
                        <FlatList data={data} renderItem={({ item }) => (
                            <TouchableOpacity style={styles.scroll_profile}>
                                <Image source={{ uri: `http://192.168.1.2:8000${item.image}` }} style={{ width: 100, height: 100 }} />
                            </TouchableOpacity>
                        )}
                            keyExtractor={(item) => item.id.toString()}
                            refreshControl={
                                <RefreshControl refreshing={isFetching} onRefresh={refetch} />
                            }
                            numColumns={3}
                        />
                    ) : (
                        <Text>No posts</Text>
                    )}
                </View>
            ) : (
                <View style={styles.form}>
                    <View style={styles.form}>
                        <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 10 }}>
                            Login
                        </Text>
                        <TextInput placeholder='Enter username' placeholderTextColor="gray" onChangeText={handleChangeUsername} style={styles.input} value={username} />
                        <TextInput placeholder='Enter password' placeholderTextColor="gray" secureTextEntry={true} onChangeText={handleChangePassword} style={styles.input} value={password} />
                        <TouchableOpacity style={styles.buttons_log} onPress={handleSubmit} >
                            <Text style={styles.textButton}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>)
            }
        </SafeAreaView>

    );
}

export default ProfileScreen;