
import React, { useState } from 'react';
import LoginForm from '@/components/LoginForm';
import LibraryDashboard from '@/components/LibraryDashboard';
import GateDashboard from '@/components/GateDashboard';
import HostelDashboard from '@/components/HostelDashboard';

type UserRole = 'library' | 'gate' | 'hostel' | null;

const Index = () => {
  const [currentUser, setCurrentUser] = useState<UserRole>(null);

  const handleLogin = (role: UserRole) => {
    setCurrentUser(role);
    console.log(`User logged in with role: ${role}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    console.log('User logged out');
  };

  // Render login form if no user is authenticated
  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // Render appropriate dashboard based on user role
  switch (currentUser) {
    case 'library':
      return <LibraryDashboard onLogout={handleLogout} />;
    case 'gate':
      return <GateDashboard onLogout={handleLogout} />;
    case 'hostel':
      return <HostelDashboard onLogout={handleLogout} />;
    default:
      return <LoginForm onLogin={handleLogin} />;
  }
};

export default Index;
