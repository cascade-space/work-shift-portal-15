
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleGoBack = () => {
    // Navigate to appropriate dashboard based on user role
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-lg mb-6">
            You don't have permission to access this page. 
            This area requires different access privileges.
          </p>
          <Button onClick={handleGoBack}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
