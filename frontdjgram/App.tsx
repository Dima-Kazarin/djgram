import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import React from 'react';
import { SafeAreaView, Text } from 'react-native';
import HomeScreen from './pages/HomeScreen';
import ProfileScreen from './pages/ProfileScreen';
import BottomNav from './pages/BottomNav';
import AddScreen from './pages/AddScreen';
import { Provider } from 'react-redux';
import { store } from './src/store';
import styles from './src/styles';
import Header from './pages/Header';
import ChatScreen from './pages/ChatScreen';
import ChatDetailScreen from './pages/ChatDetail';
import AddChatScreen from './pages/AddChatScreen';
import RegistrationScreen from './pages/RegistrationScreen';

const Stack = createStackNavigator()

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <SafeAreaView style={styles.main}>
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false, animation: 'none' }} />
            <Stack.Screen name="Add" component={AddScreen} options={{ headerShown: true, animation: 'none', header: () => <Header /> }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, animation: 'none', header: () => <Header /> }} />
            <Stack.Screen name="ChatDetail" component={ChatDetailScreen} options={{ headerShown: false, animation: 'none', }} />
            <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: true, ...TransitionPresets.SlideFromRightIOS, header: () => <Header /> }} />
            <Stack.Screen name="AddChat" component={AddChatScreen} options={{ headerShown: true, animation: 'none', header: () => <Header /> }} />
            <Stack.Screen name="Registration" component={RegistrationScreen} options={{ headerShown: true, animation: 'none', header: () => <Header /> }} />
          </Stack.Navigator>

        </SafeAreaView>
      </NavigationContainer>
    </Provider>
  );
}
export default App;
