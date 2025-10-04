import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Obtém a URL base da API a partir das suas constantes do Expo
const apiUrl = Constants.expoConfig.extra.apiUrl;

const apiClient = axios.create({
    baseURL: apiUrl,
});

// Isto é um "interceptor". Ele adiciona automaticamente o token de autorização
// a todas as requisições antes de elas serem enviadas.
apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;