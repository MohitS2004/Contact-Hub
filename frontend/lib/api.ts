import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach Authorization header from localStorage
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401 (unauthorized) - redirect to login
// Also unwraps standard API response format { success, message, data, timestamp }
apiClient.interceptors.response.use(
  (response) => {
    // If response follows standard API format, unwrap it
    if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token and user data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login page
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Helper functions
export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface UserInfo {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactData {
  name: string;
  email: string;
  phone: string;
}

export interface UpdateContactData {
  name?: string;
  email?: string;
  phone?: string;
}

// Register function
export const register = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/auth/register', {
    email,
    password,
  });
  return response.data;
};

// Login function
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/auth/login', {
    email,
    password,
  });
  return response.data;
};

// Get current user info
export const getMe = async (): Promise<UserInfo> => {
  const response = await apiClient.get<UserInfo>('/auth/me');
  return response.data;
};

// Contacts API functions
export const getContacts = async (): Promise<Contact[]> => {
  const response = await apiClient.get<Contact[]>('/contacts');
  return response.data;
};

export const getContact = async (id: string): Promise<Contact> => {
  const response = await apiClient.get<Contact>(`/contacts/${id}`);
  return response.data;
};

export const createContact = async (data: CreateContactData): Promise<Contact> => {
  const response = await apiClient.post<Contact>('/contacts', data);
  return response.data;
};

export const updateContact = async (id: string, data: UpdateContactData): Promise<Contact> => {
  const response = await apiClient.put<Contact>(`/contacts/${id}`, data);
  return response.data;
};

export const deleteContact = async (id: string): Promise<void> => {
  await apiClient.delete(`/contacts/${id}`);
};

// Export the apiClient for custom requests
export default apiClient;

