
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Ghost, ArrowRight } from 'lucide-react';
import { joinGhostCircle } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const InvitePage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [circleName, setCircleName] = useState('');
  const [circleId, setCircleId] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('circleId');
    const name = params.get('name');
    
    if (id) setCircleId(id);
    if (name) setCircleName(decodeURIComponent(name));
  }, [location.search]);

  const handleJoinCircle = async () => {
    if (!circleId) {
      toast({
        title: "Error",
        description: "Invalid invitation link",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await joinGhostCircle(circleId);
      toast({
        title: "Success!",
        description: `You've joined the Ghost Circle: ${circleName}`
      });
      navigate('/ghost-circles');
    } catch (error) {
      console.error("Error joining circle:", error);
      toast({
        title: "Failed to join circle",
        description: error?.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigate(`/login?redirect=${encodeURIComponent(`/invite?circleId=${circleId}&name=${encodeURIComponent(circleName)}`)}`);
  };

  if (!circleId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center p-8 bg-gray-800 rounded-lg shadow-lg max-w-md">
          <Ghost className="mx-auto h-16 w-16 text-purple-500 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Invitation</h1>
          <p className="text-gray-300 mb-6">This invitation link appears to be invalid or expired.</p>
          <Button onClick={() => navigate('/')} className="bg-purple-600 hover:bg-purple-700">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="text-center p-8 bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
        <Ghost className="mx-auto h-16 w-16 text-purple-500 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">
          You're invited to join a Ghost Circle!
        </h1>
        
        {circleName && (
          <h2 className="text-xl text-purple-300 mb-4">"{circleName}"</h2>
        )}
        
        <p className="text-gray-300 mb-6">
          Join this anonymous community where you can share without revealing your identity.
        </p>

        {isAuthenticated ? (
          <Button 
            onClick={handleJoinCircle} 
            className="bg-purple-600 hover:bg-purple-700 w-full"
            disabled={loading}
          >
            {loading ? "Joining..." : "Join Ghost Circle"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <div className="space-y-4">
            <p className="text-yellow-300">You need to log in to join this Ghost Circle</p>
            <Button onClick={handleLogin} className="bg-purple-600 hover:bg-purple-700 w-full">
              Login to Continue
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitePage;
