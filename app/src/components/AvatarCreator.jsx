import React, { useState, useEffect } from 'react';
import { Avatar } from './Avatar';
import { db } from '../db/database';

export const AvatarCreator = ({ onCancel, initialConfig }) => {
  const [config] = useState(initialConfig);
  const [studyTime, setStudyTime] = useState(0);

  useEffect(() => {
    async function fetchStudyTime() {
      const setting = await db.settings.get('studyTime');
      setStudyTime(setting?.value || 0);
    }
    fetchStudyTime();
  }, [])

  const userStats = {
    studyTime: config.studyTime || studyTime,
    completedTasks: config.completedTasks || 47
  };
  
  const formatStudyTime = (totalSeconds) => {
  let seconds = totalSeconds;

  const weeks = Math.floor(seconds / (7 * 24 * 60 * 60));
  seconds %= 7 * 24 * 60 * 60;

  const days = Math.floor(seconds / (24 * 60 * 60));
  seconds %= 24 * 60 * 60;

  const hours = Math.floor(seconds / (60 * 60));
  seconds %= 60 * 60;

  const minutes = Math.floor(seconds / 60);
  seconds %= 60;

  const parts = [];
  if (weeks > 0) parts.push(`${weeks} week${weeks > 1 ? 's' : ''}`);
  if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} min${minutes > 1 ? 's' : ''}`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds} sec${seconds > 1 ? 's' : ''}`);

  return parts.join(', ');
};

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-themebg rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className="p-6 md:p-8">
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center text-themetext">
            Your Stats!
          </h3>
          
          <div className="flex justify-center mb-8">
            <Avatar config={config} size="lg" />
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            <div className="w-full flex justify-between items-center p-4 bg-accent rounded-xl">
              <span className="font-semibold text-themetext">Study Time</span>
              <span className="text-lg font-bold text-themetext">{formatStudyTime(userStats.studyTime)} </span>
            </div>

            <div className="w-full flex justify-between items-center p-4 bg-accent rounded-xl">
              <span className="font-semibold text-themetext">Completed Tasks</span>
              <span className="text-lg font-bold text-themetext">{userStats.completedTasks}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-0 border-t border-gray-200">
          <button 
            onClick={onCancel} 
            className="flex-1 bg--themebg hover:bg-themebg brightness-95 text-themetext px-6 py-4 font-semibold transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
