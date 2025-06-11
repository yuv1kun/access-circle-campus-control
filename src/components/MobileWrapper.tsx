
import React, { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileWrapperProps {
  children: React.ReactNode;
}

const MobileWrapper = ({ children }: MobileWrapperProps) => {
  const isMobile = useIsMobile();

  useEffect(() => {
    // Handle mobile-specific initialization
    if (isMobile) {
      // Prevent zoom on input focus
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
      }

      // Add mobile-specific classes
      document.body.classList.add('mobile-optimized');
    }

    // Handle back button for mobile navigation
    const handleBackButton = () => {
      if (window.history.length > 1) {
        window.history.back();
      }
    };

    // Add event listener for hardware back button (Android)
    document.addEventListener('backbutton', handleBackButton);

    return () => {
      document.removeEventListener('backbutton', handleBackButton);
    };
  }, [isMobile]);

  return (
    <div className={`min-h-screen ${isMobile ? 'safe-area-top safe-area-bottom' : ''}`}>
      {children}
    </div>
  );
};

export default MobileWrapper;
