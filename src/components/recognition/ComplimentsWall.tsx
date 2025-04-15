
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star, MessageCircle } from "lucide-react";
import { format } from "date-fns";

type Compliment = {
  text: string;
  createdAt: Date;
};

type ComplimentsWallProps = {
  compliments: Compliment[];
  isLoading: boolean;
};

const ComplimentsWall: React.FC<ComplimentsWallProps> = ({
  compliments,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Card className="border border-undercover-purple/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Star className="mr-2 h-5 w-5 text-undercover-light-purple" />
            Compliments Wall
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-undercover-purple/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Star className="mr-2 h-5 w-5 text-undercover-light-purple" />
          Compliments Wall
        </CardTitle>
      </CardHeader>
      <CardContent>
        {compliments.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-md">
            <MessageCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No compliments yet</p>
            <p className="text-xs text-muted-foreground">
              Get recognized to receive compliments
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[280px] pr-4">
            {compliments.map((compliment, index) => (
              <div
                key={index}
                className="mb-3 p-3 bg-muted/20 rounded-lg border border-border"
              >
                <p className="text-sm">{compliment.text}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(compliment.createdAt), "MMM d, yyyy")}
                </p>
              </div>
            ))}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default ComplimentsWall;
