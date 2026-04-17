import { create } from 'zustand';
import api from '../lib/api';
import toast from 'react-hot-toast';

// JWT helper functions
const decodeToken = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Token decode error:', error);
        return null;
    }
};

const isTokenValid = (token) => {
    if (!token) return false;
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return false;
    return decoded.exp * 1000 > Date.now();
};

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  lastActivity: Date.now(),

  // Initialize auth state
  initAuth: () => {
    try {
      const token = sessionStorage.getItem('token');
      const user = JSON.parse(sessionStorage.getItem('user') || 'null');
      
      console.log('initAuth called - token:', !!token, 'user:', !!user);
      
      if (token && user && isTokenValid(token)) {
        set({ user, token, isAuthenticated: true, isInitialized: true });
        console.log('✅ Auth initialized with valid token for:', user.email);
        return true;
      } else {
        // Clear invalid auth data
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false, isInitialized: true });
        console.log('❌ Auth cleared - no valid token');
        return false;
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false, isInitialized: true });
      return false;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      console.log('Attempting login for:', email);
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      
      const { user, token } = response.data;
      
      // Validate token before storing
      if (!isTokenValid(token)) {
        throw new Error('Invalid token received');
      }
      
      // Store auth data
      sessionStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('token', token);
      
      set({ 
        user, 
        token, 
        isAuthenticated: true, 
        isLoading: false,
        lastActivity: Date.now()
      });
      
      toast.success('Login successful!');
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error('Login error details:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || 'Login failed';
      toast.error(errorMessage);
      
      // Clear any invalid data
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false });
      
      return false;
    }
  },

  register: async (userData) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/register', userData);
      const { user, token } = response.data;
      
      // Validate token before storing
      if (!isTokenValid(token)) {
        throw new Error('Invalid token received');
      }
      
      // Store auth data
      sessionStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('token', token);
      
      set({ 
        user, 
        token, 
        isAuthenticated: true, 
        isLoading: false,
        lastActivity: Date.now()
      });
      
      toast.success('Registration successful!');
      return true;
    } catch (error) {
      set({ isLoading: false });
      const errorMessage = error.response?.data?.message || 'Registration failed';
      toast.error(errorMessage);
      return false;
    }
  },

  logout: async () => {
    try {
      // Call logout API if needed
      await api.post('/auth/logout', {}, {
        headers: {
          'Authorization': `Bearer ${get().token}`
        }
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local storage
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      
      // Reset state
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false,
        lastActivity: Date.now()
      });
      
      toast.success('Logged out successfully');
    }
  },

  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh', {
        refreshToken: sessionStorage.getItem('refreshToken')
      });
      
      const { token } = response.data;
      
      if (token && isTokenValid(token)) {
        sessionStorage.setItem('token', token);
        set({ token, lastActivity: Date.now() });
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    return false;
  },

  refreshUser: async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.status === 'success') {
        const user = response.data.user;
        sessionStorage.setItem('user', JSON.stringify(user));
        set({ user, lastActivity: Date.now() });
        return true;
      }
    } catch (error) {
      console.error('User refresh failed:', error);
    }
    return false;
  },

  updateActivity: () => {
    set({ lastActivity: Date.now() });
  },

  // Check if user has specific role
  hasRole: (role) => {
    const { user } = get();
    return user?.role === role;
  },

  // Check if user is admin
  isAdmin: () => {
    return get().hasRole('ADMIN');
  },

  // Check if user is organization
  isOrganization: () => {
    return get().hasRole('ORGANIZATION');
  },

  // Check if user is donor
  isDonor: () => {
    return get().hasRole('DONOR');
  }
}));
