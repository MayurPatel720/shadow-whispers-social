
import axios from "axios";
import { PostType, CommentType, UserType, GhostCircleType, WhisperType } from "@/types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = "/login";
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

const handleApiError = (error: any) => {
  console.error("API Error:", error);
  if (axios.isAxiosError(error)) {
    console.error("Detailed Axios Error:", error.response?.data || error.message);
  }
};

// Authentication
export const loginUser = async (email: string, password: string): Promise<UserType> => {
  try {
    const { data } = await api.post("/api/users/login", { email, password });
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const registerUser = async (
  username: string,
  fullName: string,
  email: string,
  password: string,
  referralCode?: string
): Promise<UserType> => {
  try {
    const { data } = await api.post("/api/users/register", {
      username,
      fullName,
      email,
      password,
      referralCode,
    });
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Posts
export const uploadImage = async (image: File) => {
  const formData = new FormData();
  formData.append("image", image);

  try {
    const { data } = await api.post("/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data.imageUrl;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const createPost = async (content: string, ghostCircleId?: string, imageUrl?: string) => {
  try {
    const { data } = await api.post("/api/posts", { content, ghostCircleId, imageUrl });
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getPosts = async (page = 1, limit = 10) => {
  try {
    const { data } = await api.get(`/api/posts?page=${page}&limit=${limit}`);
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getGlobalFeed = async () => {
  try {
    const { data } = await api.get("/api/posts/global");
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getPostById = async (postId: string) => {
  try {
    const { data } = await api.get(`/api/posts/${postId}`);
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const updatePost = async (
  postId: string,
  content: string,
  imageUrl?: string
) => {
  try {
    const { data } = await api.put(`/api/posts/${postId}`, { content, imageUrl });
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const deletePost = async (postId: string) => {
  try {
    const { data } = await api.delete(`/api/posts/${postId}`);
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const likePost = async (postId: string) => {
  try {
    const { data } = await api.post(`/api/posts/${postId}/like`);
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const unlikePost = async (postId: string) => {
  try {
    const { data } = await api.post(`/api/posts/${postId}/unlike`);
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Comments
export const addComment = async (postId: string, text: string, anonymousAlias?: string) => {
  try {
    const { data } = await api.post(`/api/posts/${postId}/comments`, { text, anonymousAlias });
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getComments = async (postId: string) => {
  try {
    const { data } = await api.get(`/api/posts/${postId}/comments`);
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const editComment = async (postId: string, commentId: string, text: string) => {
  try {
    const { data } = await api.put(`/api/posts/${postId}/comments/${commentId}`, { text });
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const deleteComment = async (postId: string, commentId: string) => {
  try {
    const { data } = await api.delete(
      `/api/posts/${postId}/comments/${commentId}`
    );
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const replyToComment = async (postId: string, commentId: string, content: string, anonymousAlias?: string) => {
  try {
    const { data } = await api.post(`/api/posts/${postId}/comments/${commentId}/replies`, {
      content,
      anonymousAlias
    });
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// User Profile
export const getUserProfile = async () => {
  try {
    const { data } = await api.get("/api/users/profile");
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const updateUserProfile = async (updates: {
  fullName?: string;
  bio?: string;
  anonymousAlias?: string;
  avatarEmoji?: string;
}) => {
  try {
    const { data } = await api.put("/api/users/profile", updates);
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getUserPosts = async (userId: string) => {
  try {
    const { data } = await api.get(`/api/users/userposts/${userId}`);
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Ghost Circles
export const getMyGhostCircles = async () => {
  try {
    const { data } = await api.get("/api/ghost-circles");
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const createGhostCircle = async (name: string, description: string) => {
  try {
    const { data } = await api.post("/api/ghost-circles", { name, description });
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getGhostCircleById = async (circleId: string) => {
  try {
    const { data } = await api.get(`/api/ghost-circles/${circleId}`);
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getGhostCirclePosts = async (circleId: string) => {
  try {
    const { data } = await api.get(`/api/ghost-circles/${circleId}/posts`);
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const inviteToGhostCircle = async (circleId: string, username: string) => {
  try {
    const { data } = await api.post(`/api/ghost-circles/${circleId}/invite`, { username });
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const joinGhostCircle = async (circleId: string) => {
  try {
    const { data } = await api.post(`/api/ghost-circles/${circleId}/join`);
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Whispers
export const getMyWhispers = async () => {
  try {
    const { data } = await api.get("/api/whispers");
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getWhisperConversation = async (userId: string) => {
  try {
    const { data } = await api.get(`/api/whispers/${userId}`);
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const sendWhisper = async (receiverId: string, content: string) => {
  try {
    const { data } = await api.post("/api/whispers", { receiverId, content });
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const deleteWhisperMessage = async (messageId: string) => {
  try {
    const { data } = await api.delete(`/api/whispers/${messageId}`);
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// User Search
export const searchUsers = async (query: string) => {
  try {
    const { data } = await api.get(`/api/users/search?q=${query}`);
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Recognition
export const recognizeUser = async (targetUserId: string) => {
  try {
    const { data } = await api.post("/api/users/recognize", { targetUserId });
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const revokeRecognition = async (targetUserId: string) => {
   try {
    const { data } = await api.post("/api/users/revoke-recognition", { targetUserId });
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const leaveCompliment = async (targetUserId: string, text: string) => {
  try {
    const { data } = await api.post("/api/users/compliment", { targetUserId, text });
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getRecognitionStats = async () => {
  try {
    const { data } = await api.get("/api/users/recognition-stats");
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const challengeUser = async (targetUserId: string) => {
  try {
    const { data } = await api.post("/api/users/challenge", { targetUserId });
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Referrals
export const getReferralInfo = async () => {
  try {
    const { data } = await api.get("/api/referrals/info");
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const claimReferralReward = async (rewardId: string) => {
  try {
    const { data } = await api.post(`/api/referrals/claim/${rewardId}`);
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
