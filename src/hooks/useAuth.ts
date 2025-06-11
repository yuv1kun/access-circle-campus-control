
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
      
      // Query admin user by username - try different table name formats
      const { data: adminUser, error } = await supabase
        .from('admin_users') // Changed from 'Admin_Users' to lowercase
        .select('id, username, password_hash, role, status')
        .eq('username', username)
        .eq('status', 'active')
        .single();

      console.log('Database query result:', { adminUser, error });

      if (error) {
        console.log('Database error:', error);
        
        // If table not found, try with original case
        if (error.code === '42P01') {
          console.log('Trying with uppercase table name...');
          const { data: adminUserAlt, error: errorAlt } = await supabase
            .from('Admin_Users')
            .select('id, username, password_hash, role, status')
            .eq('username', username)
            .eq('status', 'active')
            .single();
          
          console.log('Alternative query result:', { adminUserAlt, errorAlt });
          
          if (errorAlt || !adminUserAlt) {
            toast({
              title: "Login Failed",
              description: "Database connection error or user not found",
              variant: "destructive",
            });
            return null;
          }
          
          // Use the alternative result
          const isPasswordValid = await validatePassword(password, adminUserAlt.role);
          
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
            description: `Welcome to AccessCircle ${adminUserAlt.role} dashboard`,
          });

          return {
            id: adminUserAlt.id,
            username: adminUserAlt.username,
            role: adminUserAlt.role,
            status: adminUserAlt.status
          };
        }
        
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
