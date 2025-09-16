import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api', // Sua URL base da API
});

// Você pode adicionar interceptors aqui para incluir o token JWT automaticamente
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token'); // Ou de onde quer que você pegue o token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default apiClient;