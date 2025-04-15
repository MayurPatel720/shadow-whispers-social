
export interface PostType {
  _id: string;
  content: string;
  imageUrl?: string;
  user: string;
  likes: { user: string }[];
  comments: any[];
  createdAt: string;
  updatedAt: string;
  anonymousAlias: string;
  avatarEmoji: string;
}

export interface CommentType {
  _id: string;
  text: string;
  user: string;
  post: string;
  createdAt: string;
  updatedAt: string;
  replies?: CommentType[];
  anonymousAlias?: string;
  avatarEmoji?: string;
}

export interface UserType {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  anonymousAlias: string;
  avatarEmoji: string;
  bio?: string;
  token?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GhostCircleType {
  _id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: {
    _id: string;
    anonymousAlias: string;
    avatarEmoji?: string;
    joinedAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface WhisperType {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  senderAlias?: string;
  senderEmoji?: string;
}

export interface RecognitionStatsType {
  recognizedCount: number;
  recognizedByCount: number;
  shadowReputation: number;
  complimentsReceived: number;
  recognitionRate: number;
  level: string;
}

export interface ReferralInfoType {
  code: string;
  invitesSent: number;
  invitesAccepted: number;
  rewards: {
    id: string;
    name: string;
    description: string;
    threshold: number;
    claimed: boolean;
  }[];
}
