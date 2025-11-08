import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { db } from './db/database';
import { defaultAvatarConfig } from './utils/avatarOptions';
import { Layout } from './components/Layout';
import { AvatarCreator } from './components/AvatarCreator';
import { MainPage } from './pages/MainPage';
import { MenuPage } from './pages/MenuPage';
import { TodoPage } from './pages/TodoPage';
import { GroupsPage } from './pages/GroupsPage';
import { GroupDetailPage } from './pages/GroupDetailPage';
import { ObjectDetailPage } from './pages/ObjectDetailPage';

export default function App() {
  const { 
    currentPage,
    theme,
    setTheme,
    avatarConfig,
    setAvatarConfig,
    showAvatarCreator,
    setShowAvatarCreator 
  } = useAppStore();

  const [initialized, setInitialized] = React.useState(false);

  useEffect(() => {
    initDB();
  }, []);

  const initDB = async () => {
    // Initialize database
    await db.open();

    // Load theme
    const themeSetting = await db.settings.get('theme');
    if (themeSetting) {
      setTheme(themeSetting.value);
    }

    // Load avatar
    const avatarSetting = await db.settings.get('avatar');
    if (avatarSetting) {
      setAvatarConfig(avatarSetting.value);
    } else {
      // Set default avatar
      setAvatarConfig(defaultAvatarConfig);
      await db.settings.put({ key: 'avatar', value: defaultAvatarConfig });
    }

    setInitialized(true);
  };

  const saveAvatar = async (config) => {
    await db.settings.put({ key: 'avatar', value: config });
    setAvatarConfig(config);
    setShowAvatarCreator(false);
  };

  if (!initialized) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="text-center">
          <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text mb-4">
            U-mi
          </div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'main':
        return <MainPage />;
      case 'menu':
        return <MenuPage />;
      case 'todos':
        return (
          <Layout>
            <TodoPage />
          </Layout>
        );
      case 'groups':
        return (
          <Layout>
            <GroupsPage />
          </Layout>
        );
      case 'group-detail':
        return (
          <Layout>
            <GroupDetailPage />
          </Layout>
        );
      case 'object-detail':
        return (
          <Layout>
            <ObjectDetailPage />
          </Layout>
        );
      default:
        return <MainPage />;
    }
  };

  return (
    <>
      {renderPage()}
      
      {/* Avatar Creator Modal */}
      {showAvatarCreator && avatarConfig && (
        <AvatarCreator
          initialConfig={avatarConfig}
          onSave={saveAvatar}
          onCancel={() => setShowAvatarCreator(false)}
        />
      )}
    </>
  );
}