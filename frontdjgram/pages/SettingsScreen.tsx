import { Platform, SafeAreaView, StatusBar, Text,  TouchableOpacity } from 'react-native';
import styles from '../src/styles';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import TokenStorage from '../src/services/api/JwtToken';
import Header from './Header';
interface SettingsProps {
    navigation: StackNavigationProp<any, any>
}

const SettingsScreen = () => {
    const navigation = useNavigation<SettingsProps>()

    const handleLogout = async () => {
        TokenStorage.removeTokens()
        navigation.navigate('Profile', {isAuth: false})
    }

    return (
        <SafeAreaView style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, flex: 1 }}>
            <Header />
            <TouchableOpacity style={styles.buttons_logout} onPress={handleLogout} >
                <Text style={styles.textButton}>Logout</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

export default SettingsScreen