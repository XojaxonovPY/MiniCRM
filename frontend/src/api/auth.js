import { apiRequest } from './client';

export const authApi = {
  login: async (credentials) => {
    // credentials: { email?: string, phone_number?: string, password: string }
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
    }
    return data;
  },

  register: async (userData) => {
    // userData: { full_name, email, phone_number, password }
    return await apiRequest('/auth/user/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getMe: async () => {
    return await apiRequest('/auth/users/me', {
      method: 'GET',
    });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};
