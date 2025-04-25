import React from 'react';
import { Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import styles from '../src/styles';

interface BottomNavProps {
  navigation?: StackNavigationProp<any, any>
  disconnectPostSockets?: () => void
}

const BottomNav = ({ disconnectPostSockets }: BottomNavProps) => {
  const navigation = useNavigation<StackNavigationProp<any, any>>();

  const handleAddPress = () => {
    if (disconnectPostSockets) {
      disconnectPostSockets()
    }
    navigation.navigate('Add')
  };

  const handleProfilePress = () => {
    if (disconnectPostSockets) {
      disconnectPostSockets()
    }
    navigation.navigate('Profile')
  };

  return (
    <SafeAreaView style={styles.navigation_buttons} >
      <TouchableOpacity style={styles.button_home} onPress={() => navigation.navigate('Home')}>
        <Image source={require('../src/static/home.png')} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button_add} onPress={handleAddPress}>
        <Image source={require('../src/static/add.png')} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button_profile} onPress={handleProfilePress}>
        <Image source={require('../src/static/profile.png')} />
      </TouchableOpacity>
    </SafeAreaView >
  )
}

export default BottomNav;