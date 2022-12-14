import axios, { AxiosRequestConfig } from 'axios';
import { API_URL } from '../variables/constants';

const $api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

$api.interceptors.request.use((config: AxiosRequestConfig) => {
  let token = localStorage.getItem('token');
  if (config.url && config.url.includes('/tokens')) token = localStorage.getItem('refreshToken');

  return {
    ...config,
    headers: { ...config.headers, Authorization: `Bearer ${token}` },
  };
});

$api.interceptors.response.use(
  (config: AxiosRequestConfig) => config,
  async (error) => {
    if (error.response.status === 401) {
      localStorage.removeItem('userName');
      localStorage.removeItem('userId');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }

    // TODO Баг бесконечной петли, возможно, из за того, что скрипты запускаются по 2 раза
    // Попробовать раскомментить на проде

    /* const originalRequest = error.config;
    if (error.response.status === 401 && error.config && error.config.isTry !== true) {
      originalRequest.isTry = true;
      try {
        const userId = localStorage.getItem('userId');
        const response = await $api.post(`/users/${userId}/tokens`);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        return $api.request(originalRequest);
      } catch (err) {
        // console.log('Не авторизован', 'axios/index.ts');
      }
    } */
    throw error;
  }
);

export default $api;
