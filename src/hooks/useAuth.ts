
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface AdminUser {
  id: number;
  username: string;
  role: 'library' | 'gate' | 'hostel';
  status: 'active' | 'inactive';
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const authenticate = async (username: string, password: string): Promise<AdminUser | null> => {
    setIsLoading(true);
    
    try {
      console.log('Attempting to authenticate user:', username);
      
      // Query admin user by username using the correct table name
      const { data: adminUser, error } = await supabase
        .from('admin_users') // Using lowercase table name as per schema
        .select('id, username, password_hash, role, status')
        .eq('username', username)
        .eq('status', 'active')
        .single();

      console.log('Database query result:', { adminUser, error });

      if (error) {
        console.log('Database error:', error);
        toast({
          title: "Login Failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
        return null;
      }

      if (!adminUser) {
        toast({
          title: "Login Failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
        return null;
      }

      // For demo purposes, we'll do a simple password comparison
      // In production, you would use proper password hashing comparison
      const isPasswordValid = await validatePassword(password, adminUser.role);
      
      if (!isPasswordValid) {
        toast({
          title: "Login Failed", 
          description: "Invalid username or password",
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Login Successful",
        description: `Welcome to AccessCircle ${adminUser.role} dashboard`,
      });

      return {
        id: adminUser.id,
        username: adminUser.username,
        role: adminUser.role,
        status: adminUser.status
      };
      
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: "Login Failed",
        description: "An error occurred during authentication",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Simple password validation for demo (matches original passwords)
  const validatePassword = async (password: string, role: string): Promise<boolean> => {
    const validPasswords = {
      'library': 'Library@2024',
      'gate': 'Gate@2024', 
      'hostel': 'Hostel@2024'
    };
    
    return validPasswords[role as keyof typeof validPasswords] === password;
  };

  return {
    authenticate,
    isLoading
  };
};
