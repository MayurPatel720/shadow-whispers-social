
import React from "react";
import ProfileComponent from "@/components/user/ProfileComponent";
import { Button } from "@/components/ui/button";
import { Gift, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex justify-end px-4 py-2 gap-2">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 border-purple-500/30 hover:bg-purple-500/10"
          onClick={() => navigate("/whispers")}
        >
          <MessageSquare className="h-4 w-4 text-purple-400" />
          Whispers
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 border-purple-500/30 hover:bg-purple-500/10"
          onClick={() => navigate("/referrals")}
        >
          <Gift className="h-4 w-4 text-purple-400" />
          Refer & Earn ₹100
        </Button>
      </div>
      <ProfileComponent />
    </div>
  );
};

export default ProfilePage;
