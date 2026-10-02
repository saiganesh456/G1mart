import React from 'react';
import { useApp } from '../../context/AppContext';
import { DesktopFooter } from './DesktopFooter';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const { screen } = useApp();

  // Full-screen auth & splash flows don't need footer
  const isFullScreenFlow =
    screen === 'splash' ||
    screen === 'onboarding' ||
    screen === 'login' ||
    screen === 'otp' ||
    screen === 'order_success';

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col text-[#212121]">
      {/* Natural Fully Responsive Web Layout */}
      <div className="w-full flex-1 flex flex-col">
        {children}
        {!isFullScreenFlow && <DesktopFooter />}
      </div>
    </div>
  );
};
;
