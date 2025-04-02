import { SafeAreaView, Text, View, TouchableOpacity, Image, Animated } from 'react-native';
import styles from '../src/styles';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useRoute } from '@react-navigation/native';

interface HeaderProps {
    navigation: StackNavigationProp<any, any>
    disconnectSocket?: (chatId: number) => void
    disconnectPostSockets?: () => void
}

const Header = ({ disconnectSocket, disconnectPostSockets }): HeaderProps => {
    const navigation = useNavigation<HeaderProps>()
    const route = useRoute()

    const getHeaderText = () => {
        switch (route.name) {
            case 'Chat':
                return 'Chat Screen'
            case 'ChatDetail':
                return 'Chat Screen'
            case 'Add':
                return 'Add Post'
            default:
                return 'DJGRAM'
        }
    }

    const handleBackPress = () => {
        if (route.name === 'ChatDetail') {
            const chatId = route.params?.chatId
            if (chatId) {
                disconnectSocket(chatId)
            }
            navigation.navigate('Chat')
        } else if (route.name === 'Add') {
            navigation.navigate('Home')
        }
    }

    const handleDirectPress = () => {
        if (disconnectPostSockets) {
            disconnectPostSockets()
        }
        navigation.navigate('Chat')
    }

    return (
        <SafeAreaView>
            <View style={{ flexDirection: 'row' }}>
                {route.name === 'Chat' && (
                    <TouchableOpacity style={styles.back_button} onPress={() => navigation.navigate('Home')}>
                        <Image source={require('../src/static/back.png')} />
                    </TouchableOpacity>
                )}
                {route.name === 'ChatDetail' && (
                    <TouchableOpacity style={styles.back_button} onPress={handleBackPress}>
                        <Image source={require('../src/static/back.png')} />
                    </TouchableOpacity>
                )}
                {route.name === 'Add' && (
                    <TouchableOpacity style={[styles.back_button, { left: 10, paddingRight: 120 }]} onPress={handleBackPress}>
                        <Image source={require('../src/static/close.png')} />
                    </TouchableOpacity>
                )}
                <Text style={styles.text}>{getHeaderText()}</Text>
                {route.name === 'Home' && (
                    <TouchableOpacity style={styles.direct_button} onPress={handleDirectPress}>
                        <Image source={require('../src/static/direct.png')} />
                    </TouchableOpacity>
                )}
            </View>
            <Text style={styles.line}></Text>
        </SafeAreaView>

    )
}

export default Header