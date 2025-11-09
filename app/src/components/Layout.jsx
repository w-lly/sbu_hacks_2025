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
      {/* Avatar (Top Right Corner when not fullscreen) */}
      {showAvatar && avatarConfig && !splitViewFullscreen && (
        <div className="absolute top-4 right-4 z-100">
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