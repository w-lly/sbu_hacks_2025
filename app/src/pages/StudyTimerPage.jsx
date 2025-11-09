import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

export const StudyTimerPage = () => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSeconds(0);
  };

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <h2 className="text-3xl font-bold mb-6">Study Timer</h2>

      <div className="text-6xl font-mono mb-8">{formatTime(seconds)}</div>

      <div className="flex gap-6">
        <button
          onClick={toggleTimer}
          className={`px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 ${
            isActive ? "bg-themesecondary hover:bg-themesecondary" : "bg-themeaccent hover:bg-themeaccent"
          }`}
        >
          {isActive ? (
            <div className="flex items-center gap-2">
              <Pause size={20} /> Pause
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Play size={20} /> Start
            </div>
          )}
        </button>

        <button
          onClick={resetTimer}
          className="px-6 py-3 rounded-xl bg-gray-300 hover:bg-gray-400 text-black font-semibold flex items-center gap-2"
        >
          <RotateCcw size={20} /> Reset
        </button>
      </div>

      <p className="mt-8 text-gray-500 text-sm">
        Track how long you've studied today!
      </p>
    </div>
  );
};
