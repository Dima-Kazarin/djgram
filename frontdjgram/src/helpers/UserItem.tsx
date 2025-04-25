import { Image, Text, TouchableOpacity, View } from "react-native"
import { useGetUserByIdQuery } from "../services/api/api"
import styles from "../styles"

const UserItem = ({ userId, navigation }: { userId: number, navigation: any }) => {
    const { data: user, isFetching } = useGetUserByIdQuery(userId)

    if (isFetching || !user) return null

    return (
        <TouchableOpacity style={{ paddingBottom: 5 }} onPress={() => navigation.navigate('Profile', { profileId: userId })}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={{ uri: `http://192.168.1.5:8000${user[0]?.icon}` }} resizeMode='cover' style={styles.post_user_icon} />
                <Text style={{ paddingLeft: 10 }}>{user[0]?.username}</Text>
            </View>
        </TouchableOpacity>
    )
}

export default UserItem