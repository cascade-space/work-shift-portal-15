import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, LayoutDashboard, ClipboardList, LogOut, FileText } from "lucide-react";

const MobileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define navigation items based on user role
  const getNavItems = () => {
    const items = [
      {
        name: 'Dashboard',
        path: '/dashboard',
        icon: <LayoutDashboard className="w-5 h-5 mr-2" />,
        roles: ['Admin', 'Supervisor', 'Employee']
      }
    ];

    // Add role-specific items
    if (user.role === 'Supervisor') {
      items.push({
        name: 'Assign Tasks',
        path: '/assign',
        icon: <ClipboardList className="w-5 h-5 mr-2" />,
        roles: ['Supervisor']
      });
      
      items.push({
        name: 'Production Reports',
        path: '/reports',
        icon: <FileText className="w-5 h-5 mr-2" />,
        roles: ['Supervisor']
      });
    }
    
    if (user.role === 'Employee') {
      items.push({
        name: 'My Tasks',
        path: '/tasks',
        icon: <ClipboardList className="w-5 h-5 mr-2" />,
        roles: ['Employee']
      });
    }

    return items.filter(item => item.roles.includes(user.role));
  };

  const navItems = getNavItems();

  return (
    <>
      <div className="fixed bottom-4 right-4 md:hidden z-50">
        <Button
          className="w-12 h-12 rounded-full shadow-lg bg-primary hover:bg-primary-dark flex items-center justify-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden">
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl p-4 pb-20 shadow-lg">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-lg font-bold">Menu</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => handleNavigation(item.path)}
                >
                  {item.icon}
                  {item.name}
                </Button>
              ))}
              
              <Button
                variant="ghost"
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenu;
