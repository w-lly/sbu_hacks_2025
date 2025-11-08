import React, { useState, useEffect } from 'react';
import { CheckSquare, FolderOpen, Plus, Trash2, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { themes } from '../utils/themes';
import { Avatar } from '../components/Avatar';
import { db } from '../db/database';
import { TodoPage } from './TodoPage';
import { GroupsPage } from './GroupsPage';

export const MenuPage = () => {
  const { 
    theme, 
    avatarConfig, 
    setShowAvatarCreator,
    showSplitView,
    setShowSplitView,
    splitViewFullscreen,
    currentPage,
    setCurrentPage,
    setCustomPageId
  } = useAppStore();
  
  const [customPages, setCustomPages] = useState([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const t = themes[theme];

  useEffect(() => {
    loadCustomPages();
  }, []);

  const loadCustomPages = async () => {
    const pages = await db.customPages.toArray();
    setCustomPages(pages.sort((a, b) => (a.order || 0) - (b.order || 0)));
  };

  const addCustomPage = async () => {
    const name = prompt('Custom page name:');
    if (name && name.trim()) {
      const order = customPages.length;
      await db.customPages.add({ name: name.trim(), icon: 'FolderOpen', order });
      loadCustomPages();
    }
  };

  const deleteCustomPage = async (id, e) => {
    e.stopPropagation();
    if (confirm('Delete this custom page?')) {
      await db.customPages.delete(id);
      
      // Delete all groups in this custom page
      const groups = await db.groups.where('customPageId').equals(id).toArray();
      for (const group of groups) {
        await db.groups.delete(group.id);
        // Delete objects in group
        const objects = await db.objects.where('groupId').equals(group.id).toArray();
        for (const obj of objects) {
          await db.objects.delete(obj.id);
          await db.objectFields.where('objectId').equals(obj.id).delete();
          await db.files.where('objectId').equals(obj.id).delete();
        }
      }
      
      if (selectedMenuItem?.id === id) {
        setSelectedMenuItem(null);
        setShowSplitView(false);
      }
      loadCustomPages();
    }
  };

  const handleMenuItemClick = (item) => {
    setSelectedMenuItem(item);
    setShowSplitView(true);
    if (item.type === 'custom') {
      setCustomPageId(item.id);
      setCurrentPage('groups');
    } else {
      setCurrentPage(item.type);
    }
  };

  const closeSplitView = () => {
    setShowSplitView(false);
    setSelectedMenuItem(null);
    setCurrentPage('menu');
  };

  const menuItems = [
    { type: 'todos', label: 'To-Do List', icon: CheckSquare, color: 'from-purple-400 to-pink-400' },
    { type: 'groups', label: 'Groups', icon: FolderOpen, color: 'from-blue-400 to-cyan-400' },
    ...customPages.map(page => ({
      type: 'custom',
      id: page.id,
      label: page.name,
      icon: FolderOpen,
      color: 'from-green-400 to-emerald-400'
    }))
  ];

  const renderRightView = () => {
    if (!selectedMenuItem) return null;

    switch (selectedMenuItem.type) {
      case 'todos':
        return <TodoPage embedded />;
      case 'groups':
      case 'custom':
        return <GroupsPage embedded />;
      default:
        return null;
    }
  };

  return (
    <div className={`h-screen flex ${t.text}`}>
      {/* Left Panel - Menu Icons */}
      <div 
        className={`${showSplitView && !splitViewFullscreen ? 'w-full md:w-1/3' : 'w-full'} 
          ${splitViewFullscreen ? 'hidden' : 'block'}
          transition-all duration-300 ${t.panel} overflow-y-auto`}
      >
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">Menu</h1>
            <Avatar 
              config={avatarConfig} 
              size="md" 
              onClick={() => setShowAvatarCreator(true)}
            />
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="relative group">
                  <button
                    onClick={() => handleMenuItemClick(item)}
                    className={`w-full ${t.card} p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl 
                      transition-all duration-300 flex flex-col items-center gap-3 sm:gap-4
                      hover:scale-105 ${selectedMenuItem?.label === item.label ? 'ring-4 ring-purple-400' : ''}`}
                  >
                    <div className={`p-3 sm:p-4 rounded-full bg-gradient-to-br ${item.color}`}>
                      <Icon size={32} className="text-white sm:w-12 sm:h-12" />
                    </div>
                    <span className="font-semibold text-center text-sm sm:text-base">{item.label}</span>
                  </button>
                  
                  {item.type === 'custom' && (
                    <button
                      onClick={(e) => deleteCustomPage(item.id, e)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full 
                        opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Add Custom Page Button */}
            <button
              onClick={addCustomPage}
              className={`${t.card} p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl 
                transition-all duration-300 flex flex-col items-center gap-3 sm:gap-4
                border-2 border-dashed ${t.border} hover:scale-105`}
            >
              <div className="p-3 sm:p-4 rounded-full bg-gradient-to-br from-gray-300 to-gray-400">
                <Plus size={32} className="text-white sm:w-12 sm:h-12" />
              </div>
              <span className="font-semibold text-center text-sm sm:text-base">Add Custom</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Selected Page Content */}
      {showSplitView && (
        <div 
          className={`${splitViewFullscreen ? 'w-full' : 'hidden md:block md:w-2/3'} 
            ${t.panel} border-l ${t.divider} relative transition-all duration-300
            animate-slide-in-right`}
        >
          {/* Close button */}
          <button
            onClick={closeSplitView}
            className={`absolute top-4 left-4 z-10 p-2 rounded-full ${t.card} shadow-lg hover:shadow-xl transition-all`}
          >
            <X size={20} />
          </button>

          {/* Content */}
          <div className="h-full overflow-y-auto pt-16">
            {renderRightView()}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};