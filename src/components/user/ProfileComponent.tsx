
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRound, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfileComponent = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="mx-auto max-w-lg p-4">
      <Card className="bg-card border border-undercover-purple/30">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-undercover-dark text-3xl">
            {user.avatarEmoji}
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-undercover-light-purple">
              {user.anonymousAlias}
            </CardTitle>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-t border-border my-2"></div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Your Anonymous Identity</h3>
            <p className="text-sm text-muted-foreground">
              In Undercover, you're known as <span className="text-undercover-light-purple">{user.anonymousAlias}</span>. 
              This identity stays consistent throughout your experience.
            </p>
          </div>
          
          <div className="border-t border-border my-2"></div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              className="text-sm" 
              variant="outline" 
              onClick={() => navigate("/profile/settings")}
            >
              <Settings size={16} className="mr-2" />
              Settings
            </Button>
            <Button 
              className="text-sm" 
              variant="destructive" 
              onClick={logout}
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileComponent;
