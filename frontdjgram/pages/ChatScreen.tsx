import { Text, View, TouchableOpacity, Image, FlatList, RefreshControl } from 'react-native';
import styles from '../src/styles';
import { useEffect, useState } from 'react';
import TokenStorage from '../src/services/api/JwtToken';
import { useGetUserChatsQuery, useGetUserQuery } from '../src/services/api/api';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

interface BottomNavProps {
    navigation: StackNavigationProp<any, any>
}

const ChatScreen = () => {
    const [userId, setUserId] = useState<number | null>(null)
    const navigation = useNavigation<BottomNavProps>()
    const { data: users } = useGetUserQuery()

    useEffect(() => {
        const fetchUserId = async () => {
            const id = await TokenStorage.getUserId()

            if (id !== null && id != undefined) {
                setUserId(id)
            }
        }
        fetchUserId()
    }, [])

    const { data: chats, refetch, isFetching: isChatsFetching } = useGetUserChatsQuery(userId ?? 0, { skip: userId === null })

    return (
        <View>
            {chats && (
                <FlatList data={chats}
                    renderItem={({ item }) => {
                        const memberId = item.member.filter((memberId: number) => memberId !== userId)

                        return (
                            <View style={[styles.container, { top: 20, paddingBottom: 10 }]}>
                                <TouchableOpacity onPress={() => navigation.navigate('ChatDetail', { chatId: item.id })}>
                                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{users[memberId[0] - 1]?.username}</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    }}
                    keyExtractor={(item) => item.id.toString()}
                    refreshControl={
                        <RefreshControl refreshing={isChatsFetching} onRefresh={refetch} />
                    }
                />
            )}
        </View>

    )
}

export default ChatScreen