
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  onLogin: (role: 'library' | 'gate' | 'hostel') => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Pre-configured admin credentials
  const adminCredentials = {
    'lib.admin': { password: 'Library@2024', role: 'library' as const },
    'gate.admin': { password: 'Gate@2024', role: 'gate' as const },
    'hostel.admin': { password: 'Hostel@2024', role: 'hostel' as const },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const admin = adminCredentials[username as keyof typeof adminCredentials];
    
    if (admin && admin.password === password) {
      toast({
        title: "Login Successful",
        description: `Welcome to AccessCircle ${admin.role} dashboard`,
      });
      onLogin(admin.role);
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">AccessCircle</CardTitle>
          <CardDescription>College Admin Authentication Portal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Authenticating...' : 'Login'}
            </Button>
          </form>
          <div className="mt-6 p-4 bg-muted rounded-lg text-sm">
            <p className="font-semibold mb-2">Demo Credentials:</p>
            <div className="space-y-1">
              <p>Library: lib.admin / Library@2024</p>
              <p>Gate: gate.admin / Gate@2024</p>
              <p>Hostel: hostel.admin / Hostel@2024</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
