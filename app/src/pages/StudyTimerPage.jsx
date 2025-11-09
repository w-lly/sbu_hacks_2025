import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { db } from '../db/database';

export const StudyTimerPage = () => {
  const [seconds, setSeconds] = useState(0); // current session
  const [isActive, setIsActive] = useState(false);
  const [totalTime, setTotalTime] = useState(0); // total saved time from DB

  // Load total study time from DB when component mounts
  useEffect(() => {
    async function fetchTotalTime() {
      const setting = await db.settings.get('studyTime');
      setTotalTime(setting?.value || 0);
    }
    fetchTotalTime();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = async () => {
    // Add current session seconds to totalTime
    const newTotal = totalTime + seconds;
    await db.settings.put({ key: 'studyTime', value: newTotal });
    setTotalTime(newTotal);  // update state
    setIsActive(false);      // stop timer
    setSeconds(0);           // reset session
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
