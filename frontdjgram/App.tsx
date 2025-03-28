import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import HomeScreen from './pages/HomeScreen';
import ProfileScreen from './pages/ProfileScreen';
import BottomNav from './pages/BottomNav';
import AddScreen from './pages/AddScreen';
import { Provider } from 'react-redux';
import { store } from './src/store';

const Stack = createStackNavigator()

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
    <NavigationContainer>
      <SafeAreaView style={styles.main}>
        <Text style={styles.text}>DJGRAM</Text>
        <Text style={styles.line}></Text>

        <Stack.Navigator screenOptions={{ animation: 'none' }}>
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Add" component={AddScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
        </Stack.Navigator>

        <BottomNav />
      </SafeAreaView>
    </NavigationContainer>
    </Provider>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#fff',
  },
  text: {
    fontWeight: 'bold',
    fontSize: 25,
    paddingLeft: 10,
    paddingTop: 7,
  },
  line: {
    backgroundColor: 'black',
    fontSize: 0.5,
    marginTop: 10
  },
  line_bottom: {
    backgroundColor: 'black',
    fontSize: 0.5,
    top: '82%'
  },
});

export default App;
