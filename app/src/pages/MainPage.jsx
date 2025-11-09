import React, { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { useNavigate } from "react-router-dom";
import umiGif from "../components/umi.gif";

export const MainPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnter = () => {
    // Show loading screen
    setIsLoading(true);

    // Simulate loading (1.8 seconds), then go to Menu page
    setTimeout(() => {
      navigate("menu");
    }, 1800);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-themebg">
        <img
          src={umiGif}
          alt="U-mi loading animation"
          className="w-80 sm:w-96 md:w-md lg:w-lg xl:w-xl animate-pulse transition-transform duration-700"
          style={{
            filter:
              "invert(42%) sepia(80%) saturate(230%) hue-rotate(255deg) brightness(1) contrast(1)",
          }}
        />
      </div>
    );
  }

  return (
    <div className="bg-themebg min-h-screen flex flex-col items-center justify-center p-4">
      <button onClick={handleEnter} className="group relative">
        {/* Main button */}
        <div className="relative text-7xl sm:text-8xl md:text-9xl font-bold bg-gradient-to-r from-themesecondary via-themeprimary to-themeaccent text-transparent bg-clip-text px-8 sm:px-16 py-6 sm:py-12 rounded-3xl hover:scale-105 transition-transform duration-300 bg-white/10 backdrop-blur-sm border border-white/20">
          U-mi
        </div>
      </button>
    </div>
  );
};
