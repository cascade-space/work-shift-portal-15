
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileMenu from './MobileMenu';

interface AppLayoutProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, requiredRoles }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check if user has required role
  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <MobileMenu />
        <main className="flex-1 p-4 md:p-6 overflow-auto max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
