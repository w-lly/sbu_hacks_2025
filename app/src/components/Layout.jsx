import React from 'react';
import { Settings, Maximize2, Minimize2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { themes } from '../utils/themes';
import { Avatar } from './Avatar';
import { db } from '../db/database';

export const Layout = ({ children, showSettings = true, showAvatar = true }) => {
  const { 
    theme, 
    setTheme, 
    avatarConfig, 
    setShowAvatarCreator,
    splitViewFullscreen,
    setSplitViewFullscreen,
    showSplitView
  } = useAppStore();
  
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const t = themes[theme];

  const saveTheme = async (newTheme) => {
    await db.settings.put({ key: 'theme', value: newTheme });
    setTheme(newTheme);
    setSettingsOpen(false);
  };

  return (
    <div className={`min-h-screen ${t.bg} ${t.text} relative`}>
      {/* Settings Button */}
      {showSettings && (
        <div className="absolute top-4 right-4 z-40 flex gap-2">
          {showSplitView && (
            <button
              onClick={() => setSplitViewFullscreen(!splitViewFullscreen)}
              className={`p-3 rounded-full ${t.card} shadow-lg hover:shadow-xl transition-all`}
            >
              {splitViewFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
          )}
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={`p-3 rounded-full ${t.card} shadow-lg hover:shadow-xl transition-all`}
          >
            <Settings size={20} />
          </button>
        </div>
      )}

      {/* Settings Menu */}
      {settingsOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setSettingsOpen(false)}
          />
          <div className={`absolute top-20 right-4 z-50 ${t.card} p-4 rounded-lg shadow-xl min-w-48`}>
            <h3 className="font-bold mb-3">Theme</h3>
            <button 
              onClick={() => saveTheme('light')} 
              className={`block w-full text-left px-4 py-2 rounded mb-1 transition-colors ${
                theme === 'light' ? t.accent + ' text-white' : 'hover:bg-gray-100'
              }`}
            >
              Light Pastel
            </button>
            <button 
              onClick={() => saveTheme('dark')} 
              className={`block w-full text-left px-4 py-2 rounded transition-colors ${
                theme === 'dark' ? t.accent + ' text-white' : 'hover:bg-gray-100'
              }`}
            >
              Dark Pastel
            </button>
          </div>
        </>
      )}

      {/* Avatar (Top Right Corner when not fullscreen) */}
      {showAvatar && avatarConfig && !splitViewFullscreen && (
        <div className="absolute top-4 left-4 z-40">
          <Avatar 
            config={avatarConfig} 
            size="sm" 
            onClick={() => setShowAvatarCreator(true)}
          />
        </div>
      )}

      {/* Main Content */}
      {children}
    </div>
  );
};