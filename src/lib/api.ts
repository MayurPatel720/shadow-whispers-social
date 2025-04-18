// lib/api-client.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { User ,Post } from '@/types/user';

// Create axios instance with base URL
const API_URL = 'http://localhost:8900';
// const API_URL = 'https://undercover-service.onrender.com';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
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
      console.log('Unauthorized, handling token refresh or re-login...');
      // Implement token refresh logic here if you have refresh tokens
      // Alternatively, trigger a logout action
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const loginUser = async (email: string, password: string): Promise<User & { token: string }> => {
  const response = await api.post('/api/users/login', { email, password });
  return response.data;
};

export const registerUser = async (
  username: string,
  fullName: string,
  email: string,
  password: string,
  referralCode?: string
): Promise<User & { token: string }> => {
  try {
    console.log('Attempting to register user with:', { username, fullName, email, referralCode });
    const response = await api.post('/api/users/register', {
      username,
      fullName,
      email,
      password,
      referralCode,
    });
    console.log('Registration response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Registration error:', error.response || error);
    throw new Error(error?.response?.data?.message || 'An error occurred during registration');
  }
};

export const getUserProfile = async (): Promise<User> => {
  const response = await api.get('/api/users/profile');
  return response.data;
};

export const updateUserProfile = async (userData: Partial<User>): Promise<User> => {
  const response = await api.put('/api/users/profile', userData);
  return response.data;
};

export const addFriend = async (friendUsername: string): Promise<User> => {
  const response = await api.post('/api/users/friends', { friendUsername });
  return response.data;
};

export const searchUsers = async (query: string): Promise<User[]> => {
  try {
    if (!query || query.trim() === '') {
      return [];
    }
    const response = await api.get(`/api/ghost-circles/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

// Ghost Circles API calls
export const createGhostCircle = async (name: string, description: string): Promise<any> => {
  const response = await api.post('/api/ghost-circles', { name, description });
  return response.data;
};

export const getMyGhostCircles = async (): Promise<any[]> => {
  const response = await api.get('/api/ghost-circles');
  return response.data;
};

export const inviteToGhostCircle = async (circleId: string, friendUsername: string): Promise<any> => {
  const response = await api.post(`/api/ghost-circles/${circleId}/invite`, { friendUsername });
  return response.data;
};

export const getGhostCirclePosts = async (circleId: string): Promise<Post[]> => {
  const response = await api.get(`/api/posts/circle/${circleId}`);
  return response.data;
};

export const createPost = async (content: string, ghostCircleId?: string, imageUrl?: string): Promise<Post> => {
  try {
    const postData = {
      content,
      ...(ghostCircleId && { ghostCircleId }),
      ...(imageUrl && { imageUrl }),
    };
    const response = await api.post('/api/posts', postData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating post:', error);
    throw error?.response?.data || error;
  }
};

export const updatePost = async (postId: string, content: string, imageUrl?: string): Promise<Post> => {
  const postData: { content: string; imageUrl?: string } = { content };
  if (imageUrl !== undefined) {
    postData.imageUrl = imageUrl;
  }
  const response = await api.put(`/api/posts/${postId}`, postData);
  return response.data;
};

export const deletePost = async (postId: string): Promise<void> => {
  await api.delete(`/api/posts/${postId}`);
};

export const getUserPosts = async (userId: string): Promise<Post[]> => {
  const response = await api.get(`/api/users/userposts/${userId}`);
  return response.data;
};

export const getGlobalFeed = async (): Promise<Post[]> => {
  const response = await api.get('/api/posts/global');
  return response.data;
};

export const likePost = async (postId: string): Promise<Post> => {
  const response = await api.put(`/api/posts/${postId}/like`);
  return response.data;
};

// Comments API calls
export const addComment = async (postId: string, content: string, anonymousAlias: string): Promise<any> => {
  const response = await api.post(`/api/posts/${postId}/comments`, { content, anonymousAlias });
  return response.data;
};

export const editComment = async (postId: string, commentId: string, content: string): Promise<any> => {
  const response = await api.put(`/api/posts/${postId}/comments/${commentId}`, { content });
  return response.data;
};

export const deleteComment = async (postId: string, commentId: string): Promise<void> => {
  await api.delete(`/api/posts/${postId}/comments/${commentId}`);
};

export const replyToComment = async (postId: string, commentId: string, content: string, anonymousAlias: string): Promise<any> => {
  const response = await api.post(`/api/posts/${postId}/comments/${commentId}/reply`, { content, anonymousAlias });
  return response.data;
};

export const getComments = async (postId: string): Promise<any[]> => {
  try {
    const response = await api.get(`/api/posts/${postId}/comments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

// Whispers API calls
export const sendWhisper = async (receiverId: string, content: string): Promise<any> => {
  try {
    const response = await api.post('/api/whispers', { receiverId, content });
    return response.data;
  } catch (error) {
    console.error('Error sending whisper:', error);
    throw error?.response?.data || error;
  }
};

export const getMyWhispers = async (): Promise<any[]> => {
  try {
    const response = await api.get('/api/whispers');
    return response.data;
  } catch (error) {
    console.error('Error fetching whispers:', error);
    throw error?.response?.data || error;
  }
};

export const getWhisperConversation = async (userId: string): Promise<any> => {
  try {
    const response = await api.get(`/api/whispers/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching whisper conversation:', error);
    throw error?.response?.data || error;
  }
};

export const markWhisperAsRead = async (whisperId: string): Promise<any> => {
  try {
    const response = await api.put(`/api/whispers/${whisperId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking whisper as read:', error);
    throw error?.response?.data || error;
  }
};

// Add new function to join a circle from an invitation
export const joinGhostCircle = async (circleId: string): Promise<any> => {
  const response = await api.post(`/api/ghost-circles/${circleId}/join`);
  return response.data;
};

// Get circle details by ID
export const getGhostCircleById = async (circleId: string): Promise<any> => {
  const response = await api.get(`/api/ghost-circles/${circleId}`);
  return response.data;
};

// Add new recognition API calls
export const recognizeUser = async (targetUserId: string, guessedIdentity: string): Promise<any> => {
  try {
    const response = await api.post('/api/users/recognize', { targetUserId, guessedIdentity });
    return response.data;
  } catch (error: any) {
    console.error('Error recognizing user:', error);
    throw error?.response?.data || error;
  }
};

export const getRecognitions = async (type = 'all', filter = 'all'): Promise<any> => {
  try {
    const response = await api.get(`/api/users/recognitions?type=${type}&filter=${filter}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching recognitions:', error);
    throw error?.response?.data || error;
  }
};

export const revokeRecognition = async (targetUserId: string): Promise<any> => {
  try {
    const response = await api.post('/api/users/revoke-recognition', { targetUserId });
    return response.data;
  } catch (error: any) {
    console.error('Error revoking recognition:', error);
    throw error?.response?.data || error;
  }
};
