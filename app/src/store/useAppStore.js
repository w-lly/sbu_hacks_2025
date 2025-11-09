import { create } from 'zustand';

export const useAppStore = create((set) => ({
  // Theme
  theme: 'light',
  setTheme: (theme) => set({ theme }),

  // Avatar
  avatarConfig: null,
  setAvatarConfig: (config) => set({ avatarConfig: config }),
  showAvatarCreator: false,
  setShowAvatarCreator: (show) => set({ showAvatarCreator: show }),

  // Split view (for menu page)
  showSplitView: false,
  setShowSplitView: (show) => set({ showSplitView: show }),
  splitViewFullscreen: false,
  setSplitViewFullscreen: (fullscreen) => set({ splitViewFullscreen: fullscreen }),

  // Custom page tracking
  customPageId: null,
  setCustomPageId: (id) => set({ customPageId: id }),

  // Selected items (for detail views)
  selectedGroupId: null,
  setSelectedGroupId: (id) => set({ selectedGroupId: id }),
  selectedObjectId: null,
  setSelectedObjectId: (id) => set({ selectedObjectId: id }),
}));