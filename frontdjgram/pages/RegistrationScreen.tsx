import { Text, View, TouchableOpacity, FlatList, RefreshControl, TextInput } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import TokenStorage from '../src/services/api/JwtToken';
import { useAddChatMutation, useGetUserQuery, useLoginUserMutation, useRegisterUserMutation } from '../src/services/api/api';
import { StackNavigationProp } from '@react-navigation/stack';
import styles from '../src/styles';

type RootStackParamList = {
    Profile: undefined
}

type RegistrationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>

interface RegistrationScreenProps {
    navigation: RegistrationScreenNavigationProp
}


const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ navigation }) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordMismatch, setPasswordMismatch] = useState(false)
    const [usernameStatus, setUsernameStatus] = useState('')

    const { data: users, refetch: refetchUsers } = useGetUserQuery()
    const [registerUser, { isLoading, isError }] = useRegisterUserMutation()

    const handleChangeUsername = (text: string) => {
        setUsername(text)
    }

    const handleChangePassword = (text: string) => {
        setPassword(text)
    }

    const handleChangeConfirmPassword = (text: string) => {
        setConfirmPassword(text)
    }

    const handleSubmit = async () => {
        if (!passwordMismatch) {
            try {
                const data = {
                    username,
                    password
                }
                await registerUser(data).unwrap()
                setUsername('')
                setPassword('')
                setConfirmPassword('')
                navigation.navigate('Profile')
            } catch (error) {
                console.error(`Error registration - ${error}`)
            }
        } 
    }

    useEffect(() => {
        if (password !== confirmPassword && confirmPassword.length > 0) {
            setPasswordMismatch(true)
        } else {
            setPasswordMismatch(false)
        }
    }, [confirmPassword, password])

    useEffect(() => {
        const unique_username = users?.filter((user) => user.username === username)
        if (username.length > 0) {
            setTimeout(() => {
                if (unique_username?.length > 0) {
                    setUsernameStatus('not unique')
                } else {
                    setUsernameStatus('unique')
                }
            }, 5000)
        }
    }, [username])

    return (
        <View>
            <View style={styles.form}>
                <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 10 }}>
                    Login
                </Text>
                <TextInput placeholder='Enter username' placeholderTextColor="gray" onChangeText={handleChangeUsername} style={styles.input} value={username} />
                {usernameStatus && (
                    <Text style={{ color: usernameStatus === 'unique' ? 'green' : 'red', marginBottom: 10 }}>
                        {usernameStatus === 'unique' ? 'Username is unique' : 'Username is not unique'}
                    </Text>
                )}
                <TextInput placeholder='Enter password' placeholderTextColor="gray" secureTextEntry={true} onChangeText={handleChangePassword} style={[styles.input, { marginBottom: 7 }]} value={password} />
                <TextInput placeholder='Confirm password' placeholderTextColor="gray" secureTextEntry={true} onChangeText={handleChangeConfirmPassword} style={styles.input} />
                {passwordMismatch && (
                    <Text style={{ color: 'red', marginBottom: 10 }}>
                        Password doesn't match
                    </Text>
                )}
                <TouchableOpacity style={[styles.buttons_log, { width: 100 }]} onPress={handleSubmit} >
                    <Text style={[styles.textButton, { fontSize: 16 }]}>Register</Text>
                </TouchableOpacity>

            </View>
        </View>
    )
}

export default RegistrationScreen