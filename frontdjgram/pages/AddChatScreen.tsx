import { Text, View, TouchableOpacity, FlatList, RefreshControl, Platform, StatusBar, Image } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import TokenStorage from '../src/services/api/JwtToken';
import { useAddChatMutation, useGetUserQuery } from '../src/services/api/api';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import Header from './Header';
import styles from '../src/styles';

type RootStackParamList = {
    ChatDetail: { chatId: number }
}

type AddChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ChatDetail'>

interface AddChatScreenProps {
    navigation: AddChatScreenNavigationProp
}

const AddChatScreen: React.FC<AddChatScreenProps> = ({ navigation }) => {
    const [userId, setUserId] = useState<number | null>(null)
    const [addChat] = useAddChatMutation()

    const handleAddChat = async (user_id: number) => {
        try {
            const data = {
                'name': `chat_${userId?.toString()}_${user_id?.toString()}`,
                'member': [
                    user_id
                ]
            }

            const response = await addChat(data).unwrap()
            navigation.navigate('ChatDetail', { chatId: response.id })
        } catch (error) {
            console.error(`Error creating chat - ${error}`)
        }
    }

    useEffect(() => {
        const fetchUserId = async () => {
            const id = await TokenStorage.getUserId()
            setUserId(id ?? null)
        }
        fetchUserId()
    }, [])

    const { data: users, refetch: refetchUsers, isFetching: isUsersFetching } = useGetUserQuery()
    const nonCurrentUsers = users?.filter((user: any) => user.id !== userId)

    useFocusEffect(
        useCallback(() => {
            if (userId !== null) {
                refetchUsers()
            }
        }, [userId, refetchUsers])
    )

    return (
        <View style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, flex: 1 }}>
            <Header />
            <FlatList data={nonCurrentUsers} renderItem={({ item }) => (
                <TouchableOpacity style={{ width: '100%' }} onPress={() => handleAddChat(item.id)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 10 }}>
                        <Image source={{ uri: `http://192.168.1.5:8000${item.icon}` }} resizeMode='cover' style={styles.post_user_icon} />
                        <Text style={{ fontSize: 20, paddingLeft: 15 }}>{item.username}</Text>
                    </View>
                </TouchableOpacity>
            )}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                    <RefreshControl refreshing={isUsersFetching} onRefresh={refetchUsers} />
                }
            />
        </View>
    )
}

export default AddChatScreen