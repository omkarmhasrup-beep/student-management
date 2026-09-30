import { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';
import { useToast } from '../hooks/useToast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
          setIsAuthenticated(true);
          localStorage.setItem('auth_user', JSON.stringify(response.data));
        } catch (error) {
          console.error("Auth init error:", error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user } = response.data;
      
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      await api.post('/auth/register', { name, email, password });
      return true;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const updateProfile = async (name, email, customFieldsConfig = undefined) => {
    try {
      const payload = { name, email };
      if (customFieldsConfig !== undefined) {
          payload.custom_fields_config = customFieldsConfig;
      }
      const response = await api.put('/users/me', payload);
      const updatedUser = response.data;
      
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      addToast('Profile updated successfully', 'success');
      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
    setIsAuthenticated(false);
    addToast('Logged out successfully', 'success');
  };

  if (loading) {
    return (
      <div className="app-container items-center justify-center">
        <div className="skeleton" style={{width: '60px', height: '60px', borderRadius: '50%'}}></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
