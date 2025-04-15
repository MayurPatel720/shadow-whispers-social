import axios from "axios";
import { PostType } from "@/types";

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

export const createPost = async (postData: {
  imageUrl: string;
  caption: string;
}) => {
  try {
    const { data } = await api.post("/api/posts", postData);
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
  updates: { caption?: string }
) => {
  try {
    const { data } = await api.put(`/api/posts/${postId}`, updates);
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

export const addComment = async (postId: string, text: string) => {
  try {
    const { data } = await api.post(`/api/posts/${postId}/comments`, { text });
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

export const deleteWhisperMessage = async (messageId: string) => {
  try {
    const { data } = await api.delete(`/api/whispers/${messageId}`);
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
