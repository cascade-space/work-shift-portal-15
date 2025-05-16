
import React from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserIcon } from "lucide-react";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-primary text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">Production System</span>
            </Link>
          </div>
          <div className="flex items-center">
            {user && (
              <>
                <div className="mr-4 hidden md:flex items-center">
                  <UserIcon className="w-5 h-5 mr-1.5" />
                  <span className="font-medium">{user.username}</span>
                  <span className="ml-2 text-sm px-2 py-0.5 bg-blue-700 text-white rounded-full">
                    {user.role}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="bg-blue-700 hover:bg-blue-800 text-white border-none"
                >
                  Sign Out
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
