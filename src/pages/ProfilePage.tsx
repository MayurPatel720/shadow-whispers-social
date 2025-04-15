
import React, { useState } from "react";
import ProfileComponent from "@/components/user/ProfileComponent";
import RecognitionContainer from "@/components/recognition/RecognitionContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRound, Users, Star } from "lucide-react";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  
  return (
    <div className="mx-auto max-w-4xl p-4">
      <Tabs defaultValue="profile" 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full mb-6">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
          <TabsTrigger value="profile" className="flex items-center">
            <UserRound size={16} className="mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="recognition" className="flex items-center">
            <Users size={16} className="mr-2" />
            Recognition
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <TabsContent value="profile" className={activeTab === "profile" ? "" : "hidden"}>
        <ProfileComponent />
      </TabsContent>
      
      <TabsContent value="recognition" className={activeTab === "recognition" ? "" : "hidden"}>
        <RecognitionContainer />
      </TabsContent>
    </div>
  );
};

export default ProfilePage;
