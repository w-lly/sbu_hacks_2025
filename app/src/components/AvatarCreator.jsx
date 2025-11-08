import React, { useState } from 'react';
import { Avatar } from './Avatar';
import { avatarOptions } from '../utils/avatarOptions';
import { ChevronRight } from 'lucide-react';

export const AvatarCreator = ({ onSave, onCancel, initialConfig }) => {
  const [config, setConfig] = useState(initialConfig);

  const cycle = (key, options) => {
    const currentIndex = options.indexOf(config[key]);
    const nextIndex = (currentIndex + 1) % options.length;
    setConfig({ ...config, [key]: options[nextIndex] });
  };

  const getDisplayValue = (key) => {
    if (key === 'skinTone' || key === 'hairColor' || key === 'clothingColor') {
      return (
        <div 
          className="w-8 h-8 rounded-full border-2 border-white shadow-md" 
          style={{ backgroundColor: config[key] }}
        />
      );
    }
    return <span className="capitalize">{config[key]}</span>;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full text-gray-800 shadow-2xl overflow-hidden">
        <div className="p-6 md:p-8">
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
            Create Your Avatar
          </h3>
          
          <div className="flex justify-center mb-8">
            <Avatar config={config} size="lg" />
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {Object.keys(avatarOptions).map((key) => (
              <button
                key={key}
                onClick={() => cycle(key, avatarOptions[key])}
                className="w-full flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl transition-all duration-200 group"
              >
                <span className="font-semibold capitalize text-left">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <div className="flex items-center gap-2">
                  {getDisplayValue(key)}
                  <ChevronRight className="w-5 h-5 text-purple-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-0 border-t border-gray-200">
          <button 
            onClick={() => onSave(config)} 
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-4 font-semibold transition-all duration-200"
          >
            Save Avatar
          </button>
          <button 
            onClick={onCancel} 
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-4 font-semibold transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};