import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import umiGif from '../components/umi.gif';

export const MainPage = () => {
  const { setCurrentPage } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnter = () => {
    // Show loading screen
    setIsLoading(true);

    // Simulate loading (1.8 seconds), then go to Menu page
    setTimeout(() => {
      setCurrentPage('menu');
    }, 1800);
  };

if (isLoading) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-transparent">
      <img
        src={umiGif}
        alt="U-mi loading animation"
        className="w-80 sm:w-96 md:w-[28rem] lg:w-[32rem] xl:w-[36rem] animate-pulse transition-transform duration-700"
        style={{
          filter: 'invert(45%) sepia(80%) saturate(260%) hue-rotate(255deg) brightness(1) contrast(1.2)' }}
        />
    </div>
  );
}

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <button
        onClick={handleEnter}
        className="group relative"
      >       
        {/* Main button */}
        <div className="relative text-7xl sm:text-8xl md:text-9xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 text-transparent bg-clip-text px-8 sm:px-16 py-6 sm:py-12 rounded-3xl hover:scale-105 transition-transform duration-300 bg-white/10 backdrop-blur-sm border border-white/20">
          U-mi
        </div>
      </button>
    </div>
  );
};