
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth, User } from '@/contexts/AuthContext';

// Mock users for demonstration - ensuring role is properly typed as UserRole
const MOCK_USERS: User[] = [
  { username: 'admin', password: 'admin123', role: 'Admin' },
  { username: 'supervisor', password: 'super123', role: 'Supervisor' },
  { username: 'employee1', password: 'emp123', role: 'Employee', id: 1, name: 'John Smith' },
  { username: 'employee2', password: 'emp123', role: 'Employee', id: 2, name: 'Jane Doe' },
];

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const user = MOCK_USERS.find(
        (user) => user.username === username && user.password === password
      );

      if (user) {
        login(user);
        toast.success(`Welcome back, ${username}!`);
        navigate('/dashboard');
      } else {
        toast.error('Invalid credentials. Please try again.');
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Production System</CardTitle>
        <CardDescription>Login to access your production dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-muted-foreground">
          <p>Demo Credentials:</p>
          <p>Admin: admin / admin123</p>
          <p>Supervisor: supervisor / super123</p>
          <p>Employee: employee1 / emp123</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
