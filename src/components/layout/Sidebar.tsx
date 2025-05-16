
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, ClipboardList, Users } from "lucide-react";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

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
    <div className="bg-gray-100 w-64 min-h-screen hidden md:block">
      <div className="p-4">
        <div className="mb-6 pt-4">
          <div className="flex items-center mb-2">
            <UserInfo user={user} />
          </div>
        </div>
        <nav>
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Button
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    location.pathname === item.path ? 'bg-primary' : ''
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  {item.icon}
                  {item.name}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

const UserInfo: React.FC<{ user: any }> = ({ user }) => {
  return (
    <div className="flex flex-col w-full p-3 rounded-lg bg-white shadow-sm mb-4">
      <div className="text-lg font-semibold">{user.name || user.username}</div>
      <div className="text-sm text-gray-500 capitalize">{user.role}</div>
    </div>
  );
};

export default Sidebar;
