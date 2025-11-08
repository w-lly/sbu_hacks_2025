import { create } from 'zustand';

export const useAppStore = create((set) => ({
  // Theme
  theme: 'light',
  setTheme: (theme) => set({ theme }),
  
  // Navigation
  currentPage: 'main',
  setCurrentPage: (page) => set({ currentPage: page }),
  
  // Split view (menu + detail)
  showSplitView: false,
  setShowSplitView: (show) => set({ showSplitView: show }),
  splitViewFullscreen: false,
  setSplitViewFullscreen: (fullscreen) => set({ splitViewFullscreen: fullscreen }),
  
  // Avatar
  avatarConfig: null,
  setAvatarConfig: (config) => set({ avatarConfig: config }),
  showAvatarCreator: false,
  setShowAvatarCreator: (show) => set({ showAvatarCreator: show }),
  
  // Selected items
  selectedGroup: null,
  setSelectedGroup: (group) => set({ selectedGroup: group }),
  selectedObject: null,
  setSelectedObject: (object) => set({ selectedObject: object }),
  
  // Breadcrumbs
  breadcrumbs: [],
  setBreadcrumbs: (crumbs) => set({ breadcrumbs: crumbs }),
  
  // Custom page context
  customPageId: null,
  setCustomPageId: (id) => set({ customPageId: id }),
}));