
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRound, Settings, LogOut, Image, Grid, Edit, MessageSquare, Trash2, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile, getUserPosts, deletePost } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import EditProfileModal from "./EditProfileModal";
import { toast } from "@/hooks/use-toast";

const ProfileComponent = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [showConfirmDeleteDialog, setshowConfirmDeleteDialog] = useState(false);


  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getUserProfile,
    enabled: !!user,
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

  const {
    data: userPosts,
    isLoading: postsLoading,
    refetch,
  } = useQuery({
    queryKey: ['userPosts', user?._id],
    queryFn: () => getUserPosts(user?._id),
    enabled: !!user?._id,
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

  const isLoading = profileLoading || postsLoading;

  if (!user) return null;

  const userStats = {
    posts: userPosts?.length || 0,
    followers: profileData?.identityRecognizers?.length || 0,
    following: profileData?.recognizedUsers?.length || 0,
  };

  return (
    <div className="mx-auto max-w-4xl p-4">
      {/* Profile Header */}
      <Card className="bg-card border border-undercover-purple/30 mb-6">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-undercover-dark text-5xl">
              {user.avatarEmoji}
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-undercover-light-purple">
                {user.anonymousAlias}
              </CardTitle>
              <p className="text-sm text-muted-foreground">@{user.username}</p>

              <div className="flex mt-4 space-x-6">
                <div className="text-center">
                  <p className="font-bold">{userStats.posts}</p>
                  <p className="text-xs text-muted-foreground">Posts</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">{userStats.followers}</p>
                  <p className="text-xs text-muted-foreground">Recognized by</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">{userStats.following}</p>
                  <p className="text-xs text-muted-foreground">Recognized</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  className="text-sm flex-1 md:flex-none"
                  onClick={() => setEditProfileOpen(true)}
                >
                  <Edit size={16} className="mr-2" />
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  className="text-sm"
                  onClick={() => navigate("/whispers")}
                >
                  <MessageSquare size={16} className="mr-2" />
                  Whispers
                </Button>
                <Button
                  variant="outline"
                  className="text-sm"
                  onClick={() => navigate("/referrals")}
                >
                  <Gift size={16} className="mr-2" />
                  Refer & Earn
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="border-t border-border my-2"></div>

          <div className="space-y-2">
            <h3 className="font-medium text-sm">Your Anonymous Identity</h3>
            <p className="text-sm text-muted-foreground">
              {user.bio ||
                `In Undercover, you're known as ${user.anonymousAlias}. This identity stays consistent throughout your experience.`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-6">
          <TabsTrigger value="posts">
            <Grid size={16} className="mr-2" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings size={16} className="mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Posts Grid */}
        <TabsContent value="posts">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : userPosts && userPosts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {userPosts.map((post) => (
                <div key={post._id} className="relative border rounded-lg overflow-hidden shadow-sm">
                  <img
                    src={post.imageUrl}
                    alt="Post"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-white/70 hover:bg-white"
                      onClick={() => navigate(`/edit-post/${post._id}`)}
                    >
                      <Edit className="text-black"  size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-white/70 hover:bg-white"
                      onClick={() => handleDeletePost(post._id)}
                    >
                      <Trash2 className="text-black" size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <Image className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Posts Yet</h3>
              <p className="text-muted-foreground mb-4">Share your thoughts anonymously!</p>
              <Button
                onClick={() => navigate("/")}
                className="bg-undercover-purple hover:bg-undercover-deep-purple"
              >
                Create your first post
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Account Settings</h4>
                <p className="text-xs text-muted-foreground">Manage your account settings and preferences.</p>
              </div>

              <div className="border-t border-border my-4"></div>

              <div className="grid grid-cols-1 gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/profile/settings")}
                  className="justify-start"
                >
                  <Settings size={16} className="mr-2" />
                  Account Settings
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to log out?")) {
                      logout();
                    }
                  }}
                  className="justify-start"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EditProfileModal open={editProfileOpen} onOpenChange={setEditProfileOpen} />
    </div>
  );
};

export default ProfileComponent;
