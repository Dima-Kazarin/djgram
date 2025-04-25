import React, { useState } from "react"
import { Image, Platform, SafeAreaView, StatusBar, Text, TouchableOpacity, View, TextInput } from "react-native"
import Header from "./Header"
import BottomNav from "./BottomNav"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { useChangeProfileMutation, useGetUserByIdQuery } from "../src/services/api/api"
import { launchImageLibrary } from "react-native-image-picker"
import styles from "../src/styles"
import { StackNavigationProp } from "@react-navigation/stack"

type RouteParams = {
    EditProfileScreen: {
        userId: number
    }
}

const EditProfileScreen = () => {
    const [icon, setIcon] = useState<string | null>(null)
    const [username, setUsername] = useState('')

    const navigation = useNavigation<StackNavigationProp<any, any>>()
    const route = useRoute<RouteProp<RouteParams, 'EditProfileScreen'>>()
    const userId = route.params.userId
    const { data: user } = useGetUserByIdQuery(userId)
    const [editProfile] = useChangeProfileMutation()

    const handleChangeUsername = (text: string) => {
        setUsername(text)
    }

    const chooseIcon = () => {
        launchImageLibrary(
            { mediaType: 'photo' },
            response => {
                if (response.didCancel) {
                    console.log('User cancelled image picker')
                } else if (response.errorCode) {
                    console.log('ImagePicker Error: ', response.errorCode)
                } else if (response.assets && response.assets.length > 0) {
                    const uri = response.assets[0].uri
                    if (uri)
                        setIcon(uri)
                }
            }
        )
    }

    const handleSubmit = async () => {
        if (!icon && !username)
            return

        const currentDate = new Date().toISOString()
        const fileName = `${currentDate}.jpg`

        const formData = new FormData()
        if (icon) {
            formData.append('icon', {
                uri: icon,
                type: 'image/jpeg',
                name: fileName
            })
        }
        if (username)
            formData.append('username', username)

        try {
            await editProfile({ userId, formData }).unwrap()
            navigation.navigate('Profile')
        } catch (error) {
            console.error("Error edit profile: ", error)
        }
    }

    return (
        <SafeAreaView style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, flex: 1 }}>
            <Header />
            <View style={{ height: '100%' }}>
                <TouchableOpacity onPress={chooseIcon} style={{ alignItems: 'center' }}>
                    {!icon ? (
                        <Image source={{ uri: `http://192.168.1.5:8000${user?.[0]?.icon}` }} resizeMode='cover' style={styles.post_user_icon} />
                    ) : (
                        <Image source={{ uri: icon }} resizeMode='cover' style={styles.post_user_icon} />
                    )}

                    <Text style={{ fontWeight: 'bold', color: 'blue' }}>Change profile icon</Text>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', paddingTop: 20, alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', bottom: 10 }}>Name: </Text>
                    <TextInput onChangeText={handleChangeUsername} value={username} style={styles.edit_input}></TextInput>
                </View>
                <TouchableOpacity onPress={handleSubmit} style={[styles.add_post_button, { marginBottom: 110 }]}>
                    <Text style={{ color: '#fff' }}>Submit</Text>
                </TouchableOpacity>
            </View>
            <BottomNav />
        </SafeAreaView>
    )
}
export default EditProfileScreen