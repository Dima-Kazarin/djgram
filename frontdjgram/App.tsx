import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import React from 'react';
import { SafeAreaView } from 'react-native';
import HomeScreen from './pages/HomeScreen';
import ProfileScreen from './pages/ProfileScreen';
import AddScreen from './pages/AddScreen';
import { Provider } from 'react-redux';
import { store } from './src/store';
import styles from './src/styles';
import Header from './pages/Header';
import ChatScreen from './pages/ChatScreen';
import ChatDetailScreen from './pages/ChatDetail';
import AddChatScreen from './pages/AddChatScreen';
import RegistrationScreen from './pages/RegistrationScreen';
import SettingsScreen from './pages/SettingsScreen';
import PostDetailScreen from './pages/PostDetailScreen';
import FollowerScreen from './pages/FollowerScreen';

const Stack = createStackNavigator()

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <SafeAreaView style={styles.main}>
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false, animation: 'none' }} />
            <Stack.Screen name="Add" component={AddScreen} options={{ headerShown: false, animation: 'none' }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false, animation: 'none' }} />
            <Stack.Screen name="ChatDetail" component={ChatDetailScreen} options={{ headerShown: false, animation: 'none', }} />
            <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false, ...TransitionPresets.SlideFromRightIOS }} />
            <Stack.Screen name="AddChat" component={AddChatScreen} options={{ headerShown: false, animation: 'none' }} />
            <Stack.Screen name="Registration" component={RegistrationScreen} options={{ headerShown: false, animation: 'none' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false, animation: 'none' }} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ headerShown: false, animation: 'none' }} />
            <Stack.Screen name="Follow" component={FollowerScreen} options={{ headerShown: false, animation: 'none' }} />
            </Stack.Navigator>
        </SafeAreaView>
      </NavigationContainer>
    </Provider>
  );
}
export default App;
