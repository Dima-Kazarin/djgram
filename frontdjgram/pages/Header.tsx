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
            case 'AddChat':
                return 'New Message'
            case 'Registration':
                return 'Registration'
            case 'Profile':
                return 'Profile'
            case 'Settings':
                return 'Settings'
            case 'Follow':
                return 'Followers'
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

    const handleAddChat = () => {
        navigation.navigate('AddChat')
    }

    const handleBackPressPost = () => {
        if (disconnectPostSockets) {
            disconnectPostSockets()
        }
        navigation.navigate('Profile')
    }

    return (
        <SafeAreaView>
            <SafeAreaView style={{ flexDirection: 'row' }}>
                {(route.name === 'Chat' || route.name === 'AddChat') && (
                    <TouchableOpacity style={[styles.back_button, { paddingRight: 100 }]} onPress={() => navigation.navigate('Home')}>
                        <Image source={require('../src/static/back.png')} />
                    </TouchableOpacity>
                )}
                {route.name === 'Registration' || route.name === 'Settings' || route.name === 'Follow' && (
                    <TouchableOpacity style={[styles.back_button, { paddingRight: 100 }]} onPress={() => navigation.navigate('Profile')}>
                        <Image source={require('../src/static/back.png')} />
                    </TouchableOpacity>
                )}
                {route.name === 'PostDetail' && (
                    <TouchableOpacity style={[styles.back_button, { paddingRight: 100 }]} onPress={handleBackPressPost}>
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
                {route.name === 'Chat' && (
                    <TouchableOpacity style={{ top: 12, width: 10, paddingLeft: '25%' }} onPress={handleAddChat}>
                        <Image source={require('../src/static/add_chat.png')} />
                    </TouchableOpacity>
                )}
                {route.name === 'Profile' && (
                    <TouchableOpacity style={{ top: 12, width: 10, paddingLeft: '70%' }} onPress={() => navigation.navigate('Settings')}>
                        <Image source={require('../src/static/menu.png')} />
                    </TouchableOpacity>
                )}
            </SafeAreaView>
            <Text style={styles.line}></Text>
        </SafeAreaView>

    )
}

export default Header