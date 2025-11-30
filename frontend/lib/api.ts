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
    // If response is paginated (has items, total, page, etc.), keep it as-is
    if (
      response.data &&
      typeof response.data === 'object' &&
      'items' in response.data &&
      'total' in response.data
    ) {
      return response;
    }
    
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

export interface PaginatedContactsResponse {
  items: Contact[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
export const getContacts = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  sortBy: 'name' | 'email' | 'createdAt' = 'createdAt',
  sortOrder: 'ASC' | 'DESC' = 'DESC',
): Promise<PaginatedContactsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    sortOrder,
  });
  
  if (search) {
    params.append('search', search);
  }

  const response = await apiClient.get<PaginatedContactsResponse>(`/contacts?${params.toString()}`);
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

// Admin API functions
export interface AdminStats {
  totalUsers: number;
  totalContacts: number;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminContact extends Contact {
  ownerEmail: string | null;
  ownerName: string | null;
}

export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await apiClient.get<AdminStats>('/admin/stats');
  return response.data;
};

export interface PaginatedUsersResponse {
  items: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getAdminUsers = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<PaginatedUsersResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (search) {
    params.append('search', search);
  }

  const response = await apiClient.get<PaginatedUsersResponse>(`/admin/users?${params.toString()}`);
  return response.data;
};

export const getAdminUser = async (id: string): Promise<AdminUser> => {
  const response = await apiClient.get<AdminUser>(`/admin/users/${id}`);
  return response.data;
};

export const deleteAdminUser = async (id: string): Promise<void> => {
  await apiClient.delete(`/admin/users/${id}`);
};

export const updateUserRole = async (id: string, role: string): Promise<AdminUser> => {
  const response = await apiClient.put<AdminUser>(`/admin/users/${id}/role`, { role });
  return response.data;
};

export interface PaginatedAdminContactsResponse {
  items: AdminContact[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getAdminContacts = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  sortBy: 'name' | 'email' | 'createdAt' = 'createdAt',
  sortOrder: 'ASC' | 'DESC' = 'DESC',
): Promise<PaginatedAdminContactsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    sortOrder,
  });
  
  if (search) {
    params.append('search', search);
  }

  const response = await apiClient.get<PaginatedAdminContactsResponse>(`/admin/contacts?${params.toString()}`);
  return response.data;
};

export const getAdminContact = async (id: string): Promise<AdminContact> => {
  const response = await apiClient.get<AdminContact>(`/admin/contacts/${id}`);
  return response.data;
};

export const deleteAdminContact = async (id: string): Promise<void> => {
  await apiClient.delete(`/admin/contacts/${id}`);
};

// Export the apiClient for custom requests
export default apiClient;

