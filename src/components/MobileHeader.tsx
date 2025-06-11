
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, Download, FileText, Camera, AlertTriangle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderAction {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary';
}

interface MobileHeaderProps {
  title: string;
  subtitle: string;
  backgroundColor: string;
  textColor: string;
  actions: HeaderAction[];
  onLogout: () => void;
}

const MobileHeader = ({ 
  title, 
  subtitle, 
  backgroundColor, 
  textColor, 
  actions, 
  onLogout 
}: MobileHeaderProps) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    // Desktop layout - show all buttons inline
    return (
      <header className={`${backgroundColor} ${textColor} p-4 shadow-lg`}>
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="opacity-80">{subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            {actions.map((action, index) => (
              <Button 
                key={index}
                variant={action.variant || 'outline'} 
                size="sm"
                onClick={action.onClick}
                className="text-black bg-white border-white hover:bg-gray-100"
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
            <Button variant="secondary" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
    );
  }

  // Mobile layout - dropdown menu for actions
  return (
    <header className={`${backgroundColor} ${textColor} p-4 shadow-lg`}>
      <div className="flex justify-between items-center">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold truncate">{title}</h1>
          <p className="text-sm opacity-80 truncate">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-black bg-white border-white hover:bg-gray-100">
                <Menu className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white z-50">
              {actions.map((action, index) => (
                <DropdownMenuItem 
                  key={index}
                  onClick={action.onClick}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {action.icon}
                  {action.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem 
                onClick={onLogout}
                className="flex items-center gap-2 cursor-pointer border-t"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
