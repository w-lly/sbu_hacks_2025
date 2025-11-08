import React from 'react';
import { useAppStore } from '../store/useAppStore';

export const MainPage = () => {
  const { setCurrentPage } = useAppStore();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <button
        onClick={() => setCurrentPage('menu')}
        className="group relative"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
        
        {/* Main button */}
        <div className="relative text-7xl sm:text-8xl md:text-9xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 text-transparent bg-clip-text px-8 sm:px-16 py-6 sm:py-12 rounded-3xl hover:scale-105 transition-transform duration-300 bg-white/10 backdrop-blur-sm border border-white/20">
          U-mi
        </div>
        
        {/* Subtitle */}
        <p className="text-center mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Click to enter
        </p>
      </button>
    </div>
  );
};