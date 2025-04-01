import { SafeAreaView, Text, View, TouchableOpacity, Image, FlatList, RefreshControl, TextInput } from 'react-native';
import styles from '../src/styles';
import { useEffect, useState } from 'react';
import TokenStorage from '../src/services/api/JwtToken';
import { useGetChatsQuery, useGetMessagesQuery, useGetMessagesByChatIdQuery } from '../src/services/api/api';

const ChatDetailScreen = () => {
    const [socket, setSocket] = useState<{ [key: number]: WebSocket }>({});
    const [messages, setMessages] = useState<any[]>([]);
    const [content, setContent] = useState('')
    const [token, setToken] = useState<string | null>(null)
    const [activeChatId, setActiveChatId] = useState<number | null>(null)

    const { data: chats } = useGetChatsQuery();
    const { data: msg, refetch, isFetching } = useGetMessagesQuery();

    const handleChangeMessage = (text: string) => {
        setContent(text)
    }

    const getToken = async () => {
        const tok = await TokenStorage.getToken()
        setToken(tok)
    }

    const handleSendMessage = () => {
        if (activeChatId !== null && socket[activeChatId]) {
            socket[activeChatId].send(JSON.stringify({ 'content': content, }))
        }
    }

    const createSocketForChat = async (chatId: number) => {
        if (!socket[chatId] && token) {
            const socketInstance = new WebSocket(`ws://192.168.1.5:8000/ws/${chatId}/?token=${token}`);
            socketInstance.onopen = () => console.log(`Connected to chat ${chatId}`);
            socketInstance.onmessage = (event) => {
                const data = JSON.parse(event.data);
                const { messages_list } = data;

                setMessages((prevState) => {
                    const existingMessages = prevState.map((message) => message.id);
                    const newMessages = messages_list.filter((message: any) => !existingMessages.includes(message.id));

                    return [...prevState, ...newMessages];
                });

            };

            socketInstance.onclose = () => {
                console.log('Websocket connection closed')
            };

            setSocket((prevState: any) => ({
                ...prevState,
                [chatId]: socketInstance,
            }));
        }
    };

    useEffect(() => {
        if (!token) {
            getToken()
        }
    }, [])

    const disconnectSocketForChat = (chatId: number) => {
        if (socket[chatId]) {
            socket[chatId]?.close();
            setSocket((prevState: any) => {
                const newState = { ...prevState };
                delete newState[chatId];
                return newState;
            });
        }
    };

    useEffect(() => {
        chats?.forEach((chat) => {
            createSocketForChat(chat.id);
            disconnectSocketForChat(chat.id);
        });
    }, [token, chats]);

    useEffect(() => {
        if (chats && chats.length > 0) {
            const activeChat = chats[0].id;
            const initialMessages = msg?.filter((message: any) => message.chat_id === activeChat);
            setMessages(initialMessages || []);
            setActiveChatId(activeChat)
        }
    }, [msg, chats]);

    return (
        <SafeAreaView>
            <FlatList
                data={messages}
                renderItem={({ item }) => (
                    <View>
                        {item.sender === 1 ? (
                            <Text style={{ left: 10 }}>{item.content}</Text>
                        ) : (
                            <Text style={{ left: '80%' }}>{item.content}</Text>
                        )}
                    </View>
                )}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
            />
            <View style={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                <TextInput placeholder='Enter message' onChangeText={handleChangeMessage} value={content}></TextInput>
                <TouchableOpacity onPress={handleSendMessage}>
                    <Text>Send</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
};

export default ChatDetailScreen;
