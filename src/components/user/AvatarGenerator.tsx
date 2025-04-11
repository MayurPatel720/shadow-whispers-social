
import React from "react";

type AvatarGeneratorProps = {
  emoji: string;
  nickname: string;
  color: string;
  size?: "sm" | "md" | "lg";
};

const AvatarGenerator: React.FC<AvatarGeneratorProps> = ({ 
  emoji, 
  nickname,
  color,
  size = "md" 
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-lg",
    md: "w-10 h-10 text-xl",
    lg: "w-12 h-12 text-2xl"
  };
  
  return (
    <div className="flex items-center space-x-2">
      <div 
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full animate-pulse-glow`}
        style={{ backgroundColor: color }}
      >
        <span>{emoji}</span>
      </div>
      <span className="font-medium text-sm text-white">{nickname}</span>
    </div>
  );
};

export default AvatarGenerator;
