
import React from 'react';
import { useParams } from 'react-router-dom';
import WhisperConversation from '@/components/whisper/WhisperConversation';

const WhisperChatPage: React.FC = () => {
  const { partnerId } = useParams<{ partnerId: string }>();

  if (!partnerId) {
    return <div className="p-4 text-center">No partner selected</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <WhisperConversation partnerId={partnerId} />
    </div>
  );
};

export default WhisperChatPage;
