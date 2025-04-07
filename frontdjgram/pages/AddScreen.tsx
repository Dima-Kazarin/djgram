import React, { useState } from 'react';
import { Image, Text, View, TextInput, TouchableOpacity, Platform, StatusBar, SafeAreaView } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import styles from '../src/styles';
import { useAddPostMutation } from '../src/services/api/api';
import { StackNavigationProp } from '@react-navigation/stack';
import Header from './Header';

type RootStackParamList = {
    Home: undefined
}

type AddScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>

interface AddScreenProps {
    navigation: AddScreenNavigationProp
}

const AddScreen: React.FC<AddScreenProps> = ({ navigation }) => {
    const [photo, setPhoto] = useState<string | null>(null)
    const [description, setDescription] = useState('')
    const [addPost, { isLoading, isError }] = useAddPostMutation()

    const handleChangeDescription = (text: string) => {
        setDescription(text)
    }

    const chooseImage = () => {
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
                        setPhoto(uri)
                }
            }
        )
    }

    const handleAdd = async () => {
        if (!photo || !description)
            return

        const currentDate = new Date().toISOString()
        const fileName = `${currentDate}.jpg`

        const formData = new FormData()
        formData.append('image', {
            uri: photo,
            type: 'image/jpeg',
            name: fileName,
        })
        formData.append('description', description)

        try {
            await addPost(formData).unwrap()
            navigation.navigate('Home')
        } catch (error) {
            console.error("Error adding post: ", error)
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
            <Header />
            <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center',  }}>
                <Text style={{ fontSize: 18, paddingBottom: 5 }}>Select Image</Text>
                <TouchableOpacity style={{ paddingTop: 5 }} onPress={chooseImage} >
                    <Image source={require('../src/static/choose_image.png')} />
                </TouchableOpacity>
                {photo && <Image source={{ uri: photo }} style={styles.image} />}
                <TextInput multiline={true} placeholder='Enter description...' placeholderTextColor="gray" onChangeText={handleChangeDescription} style={styles.input_description} value={description} />
                <TouchableOpacity style={styles.add_post_button} onPress={handleAdd} >
                    <Text style={{ backgroundColor: 'blue', color: '#fff' }}>Add post</Text>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    )
}

export default AddScreen