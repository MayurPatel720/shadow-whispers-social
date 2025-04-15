
import React, { useState } from "react";
import ProfileComponent from "@/components/user/ProfileComponent";
import RecognitionContainer from "@/components/recognition/RecognitionContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRound, Users, Star } from "lucide-react";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  
  return (
    <div className="mx-auto max-w-4xl p-4">
      <Tabs 
        defaultValue="profile" 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full mb-6"
      >
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="profile" className="flex items-center">
            <UserRound size={16} className="mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="recognition" className="flex items-center">
            <Users size={16} className="mr-2" />
            Recognition
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center">
            <Star size={16} className="mr-2" />
            Badges
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          <ProfileComponent />
        </TabsContent>
        
        <TabsContent value="recognition" className="mt-6">
          <RecognitionContainer />
        </TabsContent>
        
        <TabsContent value="badges" className="mt-6">
          <div className="text-center p-12 border border-dashed rounded-lg">
            <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Badges Yet</h3>
            <p className="text-muted-foreground">Keep participating to earn badges!</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
