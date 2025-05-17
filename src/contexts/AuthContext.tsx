
import React, { createContext, useState, useContext, useEffect } from 'react';

type UserRole = 'Admin' | 'Supervisor' | 'Employee';

export interface User {
  username: string;
  password: string; // Added password property to the User interface
  role: UserRole;
  id?: number;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for saved user on mount
    const savedUser = localStorage.getItem('productionSystemUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = (userData: User) => {
    // Create a sanitized user object without the password before storing
    const { password, ...userWithoutPassword } = userData;
    const sanitizedUser = { ...userWithoutPassword, password: '' };
    
    localStorage.setItem('productionSystemUser', JSON.stringify(sanitizedUser));
    setUser(sanitizedUser as User);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('productionSystemUser');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
