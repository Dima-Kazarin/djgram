import { Text, View, TouchableOpacity, Image, FlatList, RefreshControl, SafeAreaView } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import TokenStorage from '../src/services/api/JwtToken';
import { useGetMessagesQuery, useGetUserChatsQuery, useGetUserQuery } from '../src/services/api/api';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Header from './Header';
import { StatusBar, Platform } from 'react-native';

interface BottomNavProps {
    navigation: StackNavigationProp<any, any>
}

const ChatScreen = () => {
    const [userId, setUserId] = useState<number | null>(null)
    const navigation = useNavigation<BottomNavProps>()
    const { data: users } = useGetUserQuery()
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
                        const chatMessages = messages.filter((message) => message.chat === item.id)

                        const last_message = chatMessages[chatMessages.length - 1]
                        return (
                            <View>
                                <TouchableOpacity onPress={() => navigation.navigate('ChatDetail', { chatId: item.id })}>
                                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{users[memberId[0] - 1]?.username}</Text>
                                </TouchableOpacity>
                                {last_message?.sender === userId ? (
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ fontSize: 14, color: 'gray' }}>You: </Text>
                                        <Text>{last_message?.content}</Text>
                                    </View>
                                ) : (
                                    <Text>{last_message?.content}</Text>
                                )}

                            </View>
                        )
                    }}
                    keyExtractor={(item) => item.id.toString()}
                    refreshControl={
                        <RefreshControl refreshing={isChatsFetching} onRefresh={handleRefresh} />
                    }
                    contentContainerStyle={{ flex: 1, alignItems: 'center', height: '100%' }}
                />
            )}
        </SafeAreaView>

    )
}

export default ChatScreen