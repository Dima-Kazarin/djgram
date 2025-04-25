import { useEffect } from "react";
import { usePostLike } from "../hooks/usePostLike";
import { Image, Text, TouchableOpacity, View } from "react-native";
import styles from "../styles";
import { useGetUserByIdQuery } from "../services/api/api";

const PostItem = ({ item, navigation, setPostSockets, setRefetchFuncs, disconnectPostSockets }: any) => {
    const { likeCount, likedPosts, toggleLike, refetchLikedPosts, socket } = usePostLike({
        postId: item?.id,
        initialLikeCount: item.like_count
    });
    const { data: user } = useGetUserByIdQuery(item.author)

    useEffect(() => {
        if (socket) {
            setPostSockets((prev: any) => ({
                ...prev,
                [item.id]: socket
            }));
        }

        setRefetchFuncs((prev: any) => ({
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
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={{ uri: `http://192.168.1.5:8000${user?.[0]?.icon}` }} resizeMode='cover' style={styles.post_user_icon} />
                    <Text style={{ fontWeight: 'bold', paddingLeft: 10, fontSize: 20 }}>{user?.[0]?.username}</Text>
                </View>
            </TouchableOpacity>
            <Image source={{ uri: `http://192.168.1.5:8000${item.image}` }} resizeMode='cover' style={{ width: '100%', height: 400 }} />
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={toggleLike}>
                    <Image style={{ left: 5, top: 2 }} source={likedPosts[item.id] ? require('../static/unlike.png') : require('../static/like.png')} />
                </TouchableOpacity>
                <Text style={{ paddingLeft: 7, top: 5 }}> {likeCount} </Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontWeight: 'bold', paddingLeft: 10 }}>{user?.[0]?.username}</Text>
                <Text style={{ paddingLeft: 3 }}> {item.description} </Text>
            </View>
            <Text style={{ paddingBottom: 10, paddingLeft: 7 }}> {formatDate(item.created_at)} </Text>
        </View>
    );
};
export default PostItem