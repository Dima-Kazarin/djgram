import { SafeAreaView, Text, View, TouchableOpacity, Image, Animated } from 'react-native';
import styles from '../src/styles';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useRoute } from '@react-navigation/native';

interface BottomNavProps {
    navigation: StackNavigationProp<any, any>;
}

const Header = () => {
    const navigation = useNavigation<BottomNavProps>();
    const route = useRoute()

    const getHeaderText = () => {
        switch (route.name) {
            case 'Chat':
                return 'Chat Screen';
            case 'ChatDetail':
                return 'Chat Screen'
            default:
                return 'DJGRAM';
        }
    };

    return (
        <SafeAreaView>
            <View style={{ flexDirection: 'row' }}>
                { route.name === 'Chat' && (
                    <TouchableOpacity style={styles.back_button} onPress={() => navigation.navigate('Home')}>
                    <Image source={require('../src/static/back.png')} />
                </TouchableOpacity>
                )}
                { route.name === 'ChatDetail' && (
                    <TouchableOpacity style={styles.back_button} onPress={() => navigation.navigate('Chat')}>
                    <Image source={require('../src/static/back.png')} />
                </TouchableOpacity>
                )}
                <Text style={styles.text}>{getHeaderText()}</Text>
                { route.name !== 'Chat' && (
                    <TouchableOpacity style={styles.direct_button} onPress={() => navigation.navigate('Chat')}>
                        <Image source={require('../src/static/direct.png')} />
                    </TouchableOpacity>
                )}
            </View>
            <Text style={styles.line}></Text>
        </SafeAreaView>

    );
}

export default Header;