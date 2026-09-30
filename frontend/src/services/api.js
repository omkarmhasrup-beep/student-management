import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.PROD ? (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : '/api/v1') : '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      // If we are not already on the login page, redirect
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getStudents = async (page = 1, limit = 20, search = '') => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append('search', search);
  const response = await api.get(`/students?${params.toString()}`);
  return response.data;
};

export const getStudent = async (id) => {
  const response = await api.get(`/students/${id}`);
  return response.data;
};

export const createStudent = async (data) => {
  const response = await api.post('/students', data);
  return response.data;
};

export const updateStudent = async (id, data) => {
  const response = await api.put(`/students/${id}`, data);
  return response.data;
};

export const patchStudent = async (id, data) => {
  const response = await api.patch(`/students/${id}`, data);
  return response.data;
};

export const deleteStudent = async (id) => {
  const response = await api.delete(`/students/${id}`);
  return response.data;
};

export const sendStudentEmail = async (id, emailData) => {
  const response = await api.post(`/students/${id}/send-email`, emailData);
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

export const getDashboardInsights = async () => {
  const response = await api.get('/ai/dashboard-insights');
  return response.data;
};

export const generateEmailDraft = async (data) => {
  const response = await api.post('/ai/email-draft', data);
  return response.data;
};

export const chatAssistant = async (data) => {
  const response = await api.post('/ai/assistant', data);
  return response.data;
};

export const studentSearch = async (data) => {
  const response = await api.post('/ai/student-search', data);
  return response.data;
};

export const translateText = async (data) => {
  const response = await api.post('/ai/translate', data);
  return response.data;
};

export const generateResumeSummary = async (data) => {
  const response = await api.post('/ai/resume-summary', data);
  return response.data;
};

export const generateInterviewPrep = async (data) => {
  const response = await api.post('/ai/interview-prep', data);
  return response.data;
};

export const generateCareerRecommendations = async (data) => {
  const response = await api.post('/ai/career-recommendations', data);
  return response.data;
};

export default api;
