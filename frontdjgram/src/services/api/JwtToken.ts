import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const storeToken = async (access_token: string, refresh_token: string) => {
    try {
        await AsyncStorage.setItem('access_token', access_token);
        await AsyncStorage.setItem('refresh_token', refresh_token);
    } catch (e) {
        console.error('Error save token', e);
    }
};

const getToken = async () => {
    try {
        return await AsyncStorage.getItem('access_token')
    } catch (e) {
        console.error('Error retrieve token', e);
        return null;
    }
};

const getRefreshToken = async () => {
    try {
        return await AsyncStorage.getItem('refresh_token')
    } catch (e) {
        console.error('Error retrieve token', e);
        return null;
    }
}

const updateToken = async () => {
    try {
        const refresh = await AsyncStorage.getItem('refresh_token');
        if (!refresh) {
            return;
        }

        const data = {
            "refresh": refresh
        };

        const response = await axios.post('http://192.168.1.2:8000/api/token/refresh/', data, { withCredentials: true });

        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.setItem('access_token', response.data.access);
    } catch (error) {
        console.error('Error updating token:', error);
    }
};

const removeTokens = async () => {
    await AsyncStorage.removeItem('access_token')
    await AsyncStorage.removeItem('refresh_token')
}

const getUserId = async () => {
    const token = await getToken()
    if (!token) return

    try {
        const decoded: { user_id: number } = jwtDecode(token)
        return decoded.user_id
    } catch (error) {
        console.error("Error decoding token:", error)
        return
    }
}

export default { storeToken, getToken, updateToken, removeTokens, getRefreshToken, getUserId }