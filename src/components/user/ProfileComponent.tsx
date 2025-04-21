import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UserRound,
  Settings,
  LogOut,
  Image,
  Grid,
  Edit,
  MessageSquare,
  Trash2,
  Award,
  Eye,
  Send,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile, getUserPosts, deletePost } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import EditProfileModal from "./EditProfileModal";
import RecognitionStats from "@/components/recognition/RecognitionStats";
import RecognitionModal from "@/components/recognition/RecognitionModal";
import { toast } from "@/hooks/use-toast";
import { User, Post } from "@/types/user";

interface ProfileComponentProps {
  userId?: string; // Optional prop for target user ID
  anonymousAlias?: string; // Optional prop for target user's alias
}

const ProfileComponent = ({ userId: targetUserId, anonymousAlias: targetAlias }: ProfileComponentProps) => {
  console.log("Target User ID:", targetUserId); // Debug log
  console.log("Target Alias:", targetAlias); // Debug log
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [recognitionModalOpen, setRecognitionModalOpen] = useState(false);

  const isOwnProfile = !targetUserId || targetUserId === user?._id;
  const currentUserId = isOwnProfile ? user?._id : targetUserId;
  console.log("Current User ID:", currentUserId); // Debug log
  console.log("Is Own Profile:", isOwnProfile); // Debug log

  const {
    data: profileData,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useQuery<User>({
    queryKey: ['userProfile', targetUserId || user?._id],
    queryFn: () => getUserProfile(currentUserId!),
    enabled: !!currentUserId,
    meta: {
      onError: () => {
        toast({
          variant: "destructive",
          title: "Failed to load profile",
          description: "Could not retrieve your profile information.",
        });
      },
    },
  });

  console.log("Profile Data:", profileData); // Debug log

  const {
    data: userPosts,
    isLoading: postsLoading,
    refetch,
  } = useQuery<Post[]>({
    queryKey: ['userPosts', currentUserId],
    queryFn: () => getUserPosts(currentUserId!),
    enabled: !!currentUserId,
    meta: {
      onError: () => {
        toast({
          variant: "destructive",
          title: "Failed to load posts",
          description: "Could not retrieve your posts.",
        });
      },
    },
  });

  const handleDeletePost = async (postId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;

    try {
      await deletePost(postId);
      toast({
        title: "Post deleted",
        description: "Your post has been successfully deleted.",
      });
      refetch();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete post",
        description: "Please try again later.",
      });
    }
  };

  const handleWhisperClick = () => {
    if (targetUserId && targetUserId !== user?._id) {
      navigate(`/chat/${targetUserId}`);
    } else {
      toast({
        variant: "destructive",
        title: "Cannot Whisper",
        description: "You cannot whisper to yourself!",
      });
    }
  };

  const isLoading = profileLoading || postsLoading;

  if (!user) return null;

  const displayedAlias = isOwnProfile
    ? profileData?.anonymousAlias || user.anonymousAlias || "Unknown User"
    : targetAlias || profileData?.anonymousAlias || "Unknown User";

  const userStats = {
    posts: userPosts?.length || 0,
    followers: profileData?.identityRecognizers?.length || 0,
    following: profileData?.recognizedUsers?.length || 0,
  };

  const claimedBadges = profileData?.claimedRewards?.filter(
    (reward) => reward.rewardType === "badge" && reward.status === "completed"
  ) || [];

  return (
    <div className="mx-auto max-w-4xl p-2 sm:p-4">
      <Card className="bg-card border border-undercover-purple/30 mb-4 sm:mb-6">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="flex h-16 w-16 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-undercover-dark text-3xl sm:text-5xl">
              {profileData?.avatarEmoji || user.avatarEmoji}
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl sm:text-2xl font-bold text-undercover-light-purple">
                {displayedAlias}
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                @{profileData?.username || user.username}
              </p>

              {claimedBadges.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {claimedBadges.map((reward) => (
                    <span
                      key={reward.tierLevel}
                      className="text-xl sm:text-2xl"
                      title="Shadow Recruiter Badge"
                    >
                      {reward.tierLevel === 1 ? "🥷" : ""}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row mt-2 sm:mt-4 space-x-0 sm:space-x-6">
                <div className="text-center mb-2 sm:mb-0">
                  <p className="font-bold text-base sm:text-lg">{userStats.posts}</p>
                  <p className="text-xs sm:text-xs text-muted-foreground">Posts</p>
                </div>
                <div className="text-center mb-2 sm:mb-0">
                  <p className="font-bold text-base sm:text-lg">{userStats.followers}</p>
                  <p className="text-xs sm:text-xs text-muted-foreground">Recognized by</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-base sm:text-lg">{userStats.following}</p>
                  <p className="text-xs sm:text-xs text-muted-foreground">Recognized</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-4">
                {isOwnProfile ? (
                  <>
                    <Button
                      variant="outline"
                      className="text-sm w-full sm:w-auto"
                      onClick={() => setEditProfileOpen(true)}
                    >
                      <Edit size={14} className="mr-2" />
                      Edit Profile
                    </Button>
                    <Button
                      variant="outline"
                      className="text-sm w-full sm:w-auto"
                      onClick={() => navigate("/whispers")}
                    >
                      <MessageSquare size={14} className="mr-2" />
                      Whispers
                    </Button>
                    <Button
                      variant="outline"
                      className="text-sm w-full sm:w-auto"
                      onClick={() => setRecognitionModalOpen(true)}
                    >
                      <Eye size={14} className="mr-2" />
                      Recognitions
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    className="text-sm w-full sm:w-auto"
                    onClick={handleWhisperClick}
                  >
                    <Send size={14} className="mr-2" />
                    Whisper
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <div className="border-t border-border my-2 sm:my-2"></div>

          <div className="space-y-2">
            <h3 className="text-sm sm:text-base font-medium">Your Anonymous Identity</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {profileData?.bio ||
                user.bio ||
                `In Undercover, you're known as ${displayedAlias}. This identity stays consistent throughout your experience.`}
            </p>
          </div>

          {profileData && (
            <RecognitionStats
              profile={profileData}
              onOpenRecognitionModal={() => setRecognitionModalOpen(true)}
            />
          )}

          {profileData?.claimedRewards?.length > 0 && (
            <div className="mt-2 sm:mt-4">
              <h3 className="text-sm sm:text-base font-medium flex items-center">
                <Award size={14} className="mr-2" />
                Your Rewards
              </h3>
              <div className="mt-2 grid grid-cols-1 gap-2">
                {profileData.claimedRewards.map((reward, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground"
                  >
                    <span>
                      {reward.rewardType === "badge"
                        ? "🥷"
                        : reward.rewardType === "cash"
                        ? "💰"
                        : "⭐"}
                    </span>
                    <p>
                      {reward.rewardType === "badge"
                        ? "Shadow Recruiter Badge"
                        : reward.rewardType === "cash"
                        ? "₹100 Cash Reward"
                        : "Premium Features"}{" "}
                      - {reward.status === "completed" ? "Claimed" : "Pending"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-2 sm:mb-6">
          <TabsTrigger value="posts" className="text-sm sm:text-base">
            <Grid size={14} className="mr-2" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-sm sm:text-base">
            <Settings size={14} className="mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 sm:h-48 w-full" />
              ))}
            </div>
          ) : userPosts && userPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              {userPosts.map((post) => (
                <div
                  key={post._id}
                  className="relative border rounded-lg overflow-hidden shadow-sm"
                >
                  <img
                    src={post.imageUrl}
                    alt="Post"
                    className="w-full h-32 sm:h-48 object-cover"
                  />
                  {isOwnProfile && (
                    <div className="absolute top-1 sm:top-2 right-1 sm:right-2 flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-white/70 hover:bg-white w-6 h-6 sm:w-8 sm:h-8"
                        onClick={() => navigate(`/edit-post/${post._id}`)}
                      >
                        <Edit className="text-black h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-white/70 hover:bg-white w-6 h-6 sm:w-8 sm:h-8"
                        onClick={() => handleDeletePost(post._id)}
                      >
                        <Trash2 className="text-black h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-12 border border-dashed rounded-lg">
              <Image className="mx-auto h-8 sm:h-12 w-8 sm:w-12 text-muted-foreground mb-2 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">No Posts Yet</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4">Share your thoughts anonymously!</p>
              <Button
                onClick={() => navigate("/")}
                className="bg-undercover-purple hover:bg-undercover-deep-purple text-sm sm:text-base"
              >
                Create your first post
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardContent className="space-y-2 sm:space-y-4 pt-4 sm:pt-6">
              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-medium">Account Settings</h4>
                <p className="text-xs sm:text-xs text-muted-foreground">
                  Manage your account settings and preferences.
                </p>
              </div>

              <div className="border-t border-border my-2 sm:my-4"></div>

              <div className="grid grid-cols-1 gap-2 sm:gap-4">
                {isOwnProfile && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/profile/settings")}
                      className="justify-start text-sm sm:text-base"
                    >
                      <Settings size={14} className="mr-2" />
                      Account Settings
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to log out?")) {
                          logout();
                        }
                      }}
                      className="justify-start text-sm sm:text-base"
                    >
                      <LogOut size={14} className="mr-2" />
                      Logout
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EditProfileModal open={editProfileOpen} onOpenChange={setEditProfileOpen} />
      <RecognitionModal
        open={recognitionModalOpen}
        onOpenChange={setRecognitionModalOpen}
      />
    </div>
  );
};

export default ProfileComponent;