import axios from 'axios';

// Interfaces
export interface Alert {
  id: string;
  userId: string;
  symbol: string;
  threshold: number;
  direction: string;
  email: string;
  createdAt: string;
  active: boolean;
}

export interface CreateAlertData {
  symbol: string;
  condition: 'above' | 'below';
  value: number;
  email: string;
  userId: string;
}

export interface StockQuote {
  symbol: string;
  displaySymbol?: string;
  name?: string;
  market?: string;
  currentPrice: number;
  previousClose: number;
  change: number;
  percentChange: string;
  highPrice?: number;
  lowPrice?: number;
  openPrice?: number;
}

export interface ApiStats {
  totalRequests: number;
  requestsToday: number;
  remainingQuota: number;
  planLimit: number;
}

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
      throw new Error(error.response.data.message || 'An error occurred');
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.request);
      throw new Error('Network error - please check your connection');
    } else {
      // Other errors
      console.error('Error:', error.message);
      throw error;
    }
  }
);

// Alert API functions
export const createAlert = async (data: CreateAlertData): Promise<Alert> => {
  // Get token from localStorage
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }

  const response = await api.post('/alerts', {
    symbol: data.symbol,
    threshold: data.value,
    direction: data.condition,
    email: data.email,
    userId: data.userId
  }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data.data;
};

export const getAlerts = async (userId: string): Promise<Alert[]> => {
  // Get token from localStorage
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }

  const response = await api.get(`/alerts?userId=${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data.data;
};

export const deleteAlert = async (alertId: string): Promise<void> => {
  // Get token from localStorage
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }

  await api.delete(`/alerts/${alertId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

// Stock API functions
export const getStockQuote = async (symbol: string): Promise<StockQuote> => {
  const response = await api.get(`/stocks/quote/${symbol}`);
  return response.data?.data;
};

export const getStockIndices = async (): Promise<StockQuote[]> => {
  const response = await api.get(`/stocks/indices`);
  if (response.data?.data) {
    return response.data.data;
  }

  return [];
};

export const getApiUsage = async (): Promise<ApiStats> => {
  const response = await api.get('/stocks/stats');
  return response.data.data;
};

export default api; 