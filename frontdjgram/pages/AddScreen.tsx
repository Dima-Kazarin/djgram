import React, { useState } from 'react';
import { Button, Image, Text, View, TextInput } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import styles from '../src/styles';
import { useAddPostMutation } from '../src/services/api/api';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
    Home: undefined;
};

type AddScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface AddScreenProps {
    navigation: AddScreenNavigationProp;
}

const AddScreen: React.FC<AddScreenProps> = ({ navigation }) => {
    const [photo, setPhoto] = useState<string | null>(null)
    const [description, setDescription] = useState('')
    const [addPost, { isLoading, error }] = useAddPostMutation()

    const handleChangeDescription = (text: string) => {
        setDescription(text)
    }

    const chooseImage = () => {
        launchImageLibrary(
            { mediaType: 'photo' },
            response => {
                if (response.didCancel) {
                    console.log('User cancelled image picker');
                } else if (response.errorCode) {
                    console.log('ImagePicker Error: ', response.errorCode);
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
            navigation.navigate('Home');
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <View>
            <Button title="Choose Photo" onPress={chooseImage} />
            {photo && <Image source={{ uri: photo }} style={{ width: 200, height: 200 }} />}
            <Text>Description:</Text>
            <TextInput placeholder='Enter description' placeholderTextColor="gray" onChangeText={handleChangeDescription} style={styles.input_description} value={description} />
            <Button title='Add post' onPress={handleAdd} />
        </View>
    );
}

export default AddScreen;