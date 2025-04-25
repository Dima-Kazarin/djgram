import { Text, View, TouchableOpacity, Image, FlatList, RefreshControl, SafeAreaView } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import TokenStorage from '../src/services/api/JwtToken';
import { useGetMessagesQuery, useGetUserChatsQuery, useGetUserQuery } from '../src/services/api/api';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Header from './Header';
import { StatusBar, Platform } from 'react-native';
import styles from '../src/styles';

const ChatScreen = () => {
    const [userId, setUserId] = useState<number | null>(null)
    const navigation = useNavigation<StackNavigationProp<any, any>>()
    const { data: users, refetch: refetchUsers, isFetching: usersFetching } = useGetUserQuery()
    const { data: messages, refetch: refetchMessages } = useGetMessagesQuery()

    useEffect(() => {
        const fetchUserId = async () => {
            const id = await TokenStorage.getUserId()

            if (id !== null && id != undefined) {
                setUserId(id)
            }
        }
        fetchUserId()
    }, [])

    useEffect(() => {
        if (userId) {
            refetchMessages()
        }
    }, [userId, refetchMessages])

    const { data: chats, refetch: refetchChats, isFetching: isChatsFetching } = useGetUserChatsQuery(userId ?? 0, { skip: userId === null })

    const handleRefresh = () => {
        refetchChats()
        refetchMessages()
        refetchUsers()
    }

    useFocusEffect(
        useCallback(() => {
            if (userId !== null) {
                handleRefresh()
            }
        }, [userId, refetchChats, refetchMessages])
    )

    return (
        <SafeAreaView style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, flex: 1 }}>
            <Header />
            {chats && (
                <FlatList data={chats}
                    renderItem={({ item }) => {
                        const memberId = item.member.filter((memberId: number) => memberId !== userId)
                        const chatMessages = messages?.filter((message) => message.chat === item.id)

                        const last_message = chatMessages?.[chatMessages.length - 1]
                        return (
                            <TouchableOpacity onPress={() => navigation.navigate('ChatDetail', { chatId: item.id })}>
                                <View>
                                    <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                                        <Image source={{ uri: `http://192.168.1.5:8000${users?.[memberId[0] - 1]?.icon}` }} resizeMode='cover' style={styles.chat_user_icon} />
                                        <View>
                                            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{users?.[memberId[0] - 1]?.username}</Text>
                                            {last_message?.sender === userId ? (
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Text style={{ fontSize: 14, color: 'gray' }}>You: </Text>
                                                    <Text>{last_message?.content}</Text>
                                                </View>
                                            ) : (
                                                <Text style={{ color: 'gray' }}>{last_message?.content}</Text>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )
                    }}
                    keyExtractor={(item) => item.id.toString()}
                    refreshControl={
                        <RefreshControl refreshing={isChatsFetching} onRefresh={handleRefresh} />
                    }
                    contentContainerStyle={{ flex: 1, alignItems: 'flex-start', left: 10, top: 20, height: '100%' }}
                />
            )}
        </SafeAreaView>

    )
}

export default ChatScreen