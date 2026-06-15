import axios, { AxiosResponse } from 'axios';

const BASE_URL = '/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('plant-wander-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ApiResponse<T> {
  data: T;
}

export const request = axiosInstance;

export const get = async <T>(url: string, params?: any): Promise<T> => {
  const response: AxiosResponse<ApiResponse<T>> = await axiosInstance.get(url, { params });
  return response.data.data;
};

export const post = async <T>(url: string, data?: any): Promise<T> => {
  const response: AxiosResponse<ApiResponse<T>> = await axiosInstance.post(url, data);
  return response.data.data;
};

export const put = async <T>(url: string, data?: any): Promise<T> => {
  const response: AxiosResponse<ApiResponse<T>> = await axiosInstance.put(url, data);
  return response.data.data;
};

export const del = async <T>(url: string): Promise<T> => {
  const response: AxiosResponse<ApiResponse<T>> = await axiosInstance.delete(url);
  return response.data.data;
};
