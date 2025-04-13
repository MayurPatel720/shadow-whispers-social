
import axios from 'axios';

// Create axios instance with base URL
// Use a default API URL that works with the development environment
const API_URL = 'https://undercover-service.onrender.com';
// const API_URL = 'http://localhost:8900';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Ensure credentials (like cookies) are included
});

// Add a request interceptor to include JWT token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token expiration or other errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration or unauthorized errors
      console.log('Unauthorized, handling token refresh or re-login...');
      // Implement token refresh logic here if you have refresh tokens
      // Alternatively, trigger a logout action
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const loginUser = async (email: string, password: string) => {
  const response = await api.post('/api/users/login', { email, password });
  return response.data;
};

export const registerUser = async (username: string, fullName: string, email: string, password: string) => {
  try {
    console.log('Attempting to register user with:', { username, fullName, email });
    const response = await api.post('/api/users/register', { username, fullName, email, password });
    console.log('Registration response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response || error);
    throw new Error(error?.response?.data?.message || 'An error occurred during registration');
  }
};

export const getUserProfile = async () => {
  const response = await api.get('/api/users/profile');
  return response.data;
};

export const updateUserProfile = async (userData: any) => {
  const response = await api.put('/api/users/profile', userData);
  return response.data;
};

export const addFriend = async (friendUsername: string) => {
  const response = await api.post('/api/users/friends', { friendUsername });
  return response.data;
};

// Ghost Circles API calls
export const createGhostCircle = async (name: string, description: string) => {
  const response = await api.post('/api/ghost-circles', { name, description });
  return response.data;
};

export const getMyGhostCircles = async () => {
  const response = await api.get('/api/ghost-circles');
  return response.data;
};

export const inviteToGhostCircle = async (circleId: string, username: string) => {
  const response = await api.post(`/api/ghost-circles/${circleId}/invite`, { username });
  return response.data;
};

// Posts API calls
export const createPost = async (content: string, ghostCircleId?: string, imageUrl?: string) => {
  const postData = { content, ghostCircleId };
  if (imageUrl) {
    postData.imageUrl = imageUrl;
  }
  const response = await api.post('/api/posts', postData);
  return response.data;
};

export const updatePost = async (postId: string, content: string, imageUrl?: string) => {
  const postData = { content };
  if (imageUrl) {
    postData.imageUrl = imageUrl;
  }
  const response = await api.put(`/api/posts/${postId}`, postData);
  return response.data;
};

export const deletePost = async (postId: string) => {
  const response = await api.delete(`/api/posts/${postId}`);
  return response.data;
};

export const getUserPosts = async (userId: string) => {
  const response = await api.get(`/api/posts/user/${userId}`);
  return response.data;
};

export const getGlobalFeed = async () => {
  const response = await api.get('/api/posts/global');
  return response.data;
};

export const likePost = async (postId: string) => {
  const response = await api.put(`/api/posts/${postId}/like`);
  return response.data;
};

// Comments API calls
export const addComment = async (postId: string, content: string) => {
  const response = await api.post(`/api/posts/${postId}/comments`, { content });
  return response.data;
};

export const getComments = async (postId: string) => {
  const response = await api.get(`/api/posts/${postId}/comments`);
  return response.data;
};

// Whispers API calls
export const sendWhisper = async (receiverId: string, content: string) => {
  const response = await api.post('/api/whispers', { receiverId, content });
  return response.data;
};

export const getMyWhispers = async () => {
  const response = await api.get('/api/whispers');
  return response.data;
};

export const getWhisperConversation = async (userId: string) => {
  const response = await api.get(`/api/whispers/${userId}`);
  return response.data;
};

export default api;
