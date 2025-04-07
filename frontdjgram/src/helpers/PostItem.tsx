import { useEffect } from "react";
import { usePostLike } from "../hooks/usePostLike";
import { Image, Text, TouchableOpacity, View } from "react-native";
import styles from "../styles";
import { useGetUserQuery } from "../services/api/api";
import { User } from "../services/api/types";

const PostItem = ({ item, navigation, setPostSockets, setRefetchFuncs, disconnectPostSockets }: any) => {
    const { likeCount, likedPosts, toggleLike, refetchLikedPosts, socket } = usePostLike({
        postId: item?.id,
        initialLikeCount: item.like_count
    });
    const { data: users } = useGetUserQuery()

    const users_dict = (users || []).reduce<{ [key: string]: string }>((acc, item: User) => {
        acc[item.id] = item.username
        return acc
    }, {})

    useEffect(() => {
        if (socket) {
            setPostSockets((prev) => ({
                ...prev,
                [item.id]: socket
            }));
        }

        setRefetchFuncs((prev) => ({
            ...prev,
            [item.id]: refetchLikedPosts
        }));
    }, [socket]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const handleProfile = () => {
        disconnectPostSockets()
        navigation.navigate('Profile', { profileId: item.author })
    }

    return (
        <View style={styles.scroll}>
            <TouchableOpacity onPress={handleProfile}>
                <Text style={{ fontWeight: 'bold', paddingLeft: 10, fontSize: 20 }}>{users_dict[item.author]}</Text>
            </TouchableOpacity>
            <Image source={{ uri: `http://192.168.1.4:8000${item.image}` }} resizeMode='cover' style={{ width: '100%', height: 400 }} />
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={toggleLike}>
                    <Image style={{ left: 5, top: 2 }} source={likedPosts[item.id] ? require('../static/unlike.png') : require('../static/like.png')} />
                </TouchableOpacity>
                <Text style={{ paddingLeft: 7, top: 5 }}> {likeCount} </Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontWeight: 'bold', paddingLeft: 10 }}>{users_dict[item.author]}</Text>
                <Text style={{ paddingLeft: 3 }}> {item.description} </Text>
            </View>
            <Text style={{ paddingBottom: 10, paddingLeft: 7 }}> {formatDate(item.created_at)} </Text>
        </View>
    );
};
export default PostItem