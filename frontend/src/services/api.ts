import axios from 'axios';
import { Product, CartItem, Receipt, Report } from '../types';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (username: string, password: string) => {
  const response = await api.post('/admin/login', { username, password });
  return response.data;
};

export const getCategories = async (): Promise<string[]> => {
  const response = await api.get('/products/categories');
  return response.data;
};

export const filterProductsByCategory = async (category: string): Promise<Product[]> => {
  const response = await api.get('/products/filter', { params: { category } });
  return response.data;
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
  const response = await api.post('/products', product);
  return response.data;
};

export const processTransaction = async (items: CartItem[], cash_paid: number): Promise<{ receipt: Receipt }> => {
  const response = await api.post('/transactions', { items, cash_paid });
  return response.data;
};

export const getReport = async (type: 'daily' | 'weekly' | 'monthly', date: string): Promise<Report> => {
  const response = await api.get('/reports', { params: { type, date } });
  return response.data;
};

export const updateProductIncrease = async (id: number, quantity: number) => {
  const response = await api.post(`/products/${id}/update-stockIncrease`, { quantity });
  return response.data;
};

export const updateProductDecrease = async (id: string, quantity: number) => {
  const response = await api.patch(`/products/${id}/update-stockDecrease`, { quantity });
  return response.data;
};

export const deleteProduct = async (id: number) => {
  const response = await api.delete(`/products/delete/${id}`);
  return response.data;
};

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get('/products/all');
  return response.data;
};
export default api;