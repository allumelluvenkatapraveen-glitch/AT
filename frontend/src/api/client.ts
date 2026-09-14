import axios from 'axios';

const fallbackApiUrl = '/api';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || fallbackApiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('local-shoppyy:unauthorized'));
    }

    return Promise.reject(error);
  },
);
