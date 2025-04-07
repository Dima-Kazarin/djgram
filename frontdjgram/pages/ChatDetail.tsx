import { SafeAreaView, Text, View, TouchableOpacity, FlatList, TextInput, Platform, StatusBar } from 'react-native';
import React, { useEffect, useCallback, useState, useRef } from 'react';
import TokenStorage from '../src/services/api/JwtToken';
import { useGetChatsQuery, useGetMessagesQuery} from '../src/services/api/api';
import { useRoute } from '@react-navigation/native';
import Header from './Header';

const ChatDetailScreen = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null)
    const [messages, setMessages] = useState<any[]>([])
    const [content, setContent] = useState('')
    const [token, setToken] = useState<string | null>(null)
    const [userId, setUserId] = useState<number | null>(null)
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);

    const { data: chats } = useGetChatsQuery()
    const { data: msg, refetch, isFetching } = useGetMessagesQuery()
    const flatListRef = useRef<FlatList<any>>(null)

    const route = useRoute()
    const { chatId } = route.params

    useEffect(() => {
        const fetchUserId = async () => {
            const id = await TokenStorage.getUserId()
            setUserId(id)
        }
        fetchUserId()
    }, [])

    const handleChangeMessage = (text: string) => {
        setContent(text)
    }

    const getToken = useCallback(async () => {
        const tok = await TokenStorage.getToken()
        setToken(tok)
    }, [])

    const handleSendMessage = () => {
        if (chatId !== null && socket) {
            socket.send(JSON.stringify({ content }))
            setContent("")
        }
    }

    const createSocketForChat = async (chatId: number) => {
        if (!socket && token) {
            const socketInstance = new WebSocket(`ws://192.168.1.4:8000/ws/${chatId}/?token=${token}`)
            socketInstance.onopen = () => {
                console.log(`Connected to chat ${chatId}`)
                setSocket(socketInstance)
            }
            socketInstance.onmessage = (event) => {
                const data = JSON.parse(event.data)
                const { messages_list } = data

                setMessages((prevState) => {
                    const existingMessageIds = new Set(prevState.map((msg) => msg.id))
                    const newMessages = messages_list.filter((msg) => !existingMessageIds.has(msg.id))

                    return [...prevState, ...newMessages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                })
            }

            socketInstance.onclose = () => {
                console.log('Websocket connection closed')
            }
        }
    }

    useEffect(() => {
        if (!token) {
            getToken()
        }
    }, [])

    const disconnectSocketForChat = (chatId: number) => {
        if (socket) {
            socket?.close()
            console.log(`Socket closed for chat ${chatId}`)
        }}

    useEffect(() => {
        if (chatId && token) {
            createSocketForChat(chatId)
        }
    }, [token, chatId])

    useEffect(() => {
        if (chats && chats.length > 0 && chatId) {
            const initialMessages = msg?.filter((message: any) => message.chat_id === chatId)
            setMessages(initialMessages || [])
        }
    }, [msg, chats, chatId])

    useEffect(() => {
        if (msg) {
            const filteredMessages = msg.filter((message: any) => message.chat === chatId)

            if (page === 1) {
                setMessages(filteredMessages)
            } else {
                setMessages((prev) => [...filteredMessages, ...prev])
            }
        }
    }, [msg])

    const loadMoreMessages = () => {
        if (!loadingMore) {
            setLoadingMore(true)
            setPage((prev) => prev + 1)
            refetch().finally(() => setLoadingMore(false))
        }
    };

    const formateDate = (dateString: any) => {
        const date = new Date(dateString)

        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')

        const formattedTime = `${hours}:${minutes}`

        return formattedTime
    }

    return (
        <SafeAreaView style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, flex: 1 }}>
            <Header disconnectSocket={disconnectSocketForChat} />
            <FlatList
                ref={flatListRef}
                data={[...messages].reverse()}
                inverted={true}
                renderItem={({ item }) => (
                    <View
                        style={{
                            alignSelf: item.sender === userId ? 'flex-end': 'flex-start',
                            backgroundColor: item.sender === userId ? '#DCF8C6': '#FFFFFF',
                            padding: 10,
                            borderRadius: 10,
                            marginBottom: 5,
                            maxWidth: '70%',
                        }}
                    >
                        <View style={{ flexDirection: 'row' }}>
                            <Text>{item.content}</Text>
                            <Text style={{ fontSize: 10, color: 'gray', paddingLeft: 5, paddingTop: 5 }}>{formateDate(item.created_at)}</Text>
                        </View>
                    </View>
                )}
                keyExtractor={(item) => item.id.toString()}
                onEndReached={loadMoreMessages}
                onEndReachedThreshold={0.1}
            />
            <View style={{ flexDirection: 'row', padding: 10, alignItems: 'center' }}>
                <TextInput
                    style={{ flex: 1, borderWidth: 1, borderRadius: 10, padding: 10 }}
                    placeholder="Enter message"
                    onChangeText={handleChangeMessage}
                    value={content}
                />
                <TouchableOpacity onPress={handleSendMessage} style={{ marginLeft: 10, padding: 10, backgroundColor: '#007AFF', borderRadius: 10 }}>
                    <Text style={{ color: 'white' }}>Send</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    )
}

export default ChatDetailScreen
