/**
 * useStore.js — Zustand global state cho InfiniNote
 */
import { create } from 'zustand'

const useStore = create((set) => ({
  // Auth
  isUnlocked: false,
  unlock: () => set({ isUnlocked: true }),

  // --- Sync State Model (V5.1) ---
  syncState: 'hydrating_local', // 'hydrating_local' | 'checking_server' | 'synced' | 'saving_local' | 'saving_remote' | 'offline_dirty' | 'conflict' | 'error'
  lastLocalEditAt: null,
  lastRemoteSaveAt: null,
  lastRemoteRevision: 0,
  hasPendingLocalChanges: false,
  conflictDetails: null,
  isOnline: navigator.onLine,
  pendingServerRefresh: false,
  lastSyncError: null,
  lastSyncAttemptAt: null,
  updateSyncState: (updates) => set((state) => ({ ...state, ...updates })),
  
  // Legacy for compatibility during refactor, will be removed if unused
  connectionStatus: navigator.onLine ? 'connected' : 'offline',
  setConnectionStatus: (status) => set({ connectionStatus: status, isOnline: status === 'connected' }),
  saveStatus: 'idle',
  setSaveStatus: (status) => set({ saveStatus: status }),

  // Toast notifications
  toasts: [],
  addToast: (toast) => set((state) => ({
    toasts: [...state.toasts, { id: Date.now(), ...toast }]
  })),
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id)
  })),

  // Canvas loading
  isLoading: true,
  setIsLoading: (v) => set({ isLoading: v }),

  // Initial snapshot from server
  initialSnapshot: null,
  setInitialSnapshot: (snapshot) => set({ initialSnapshot: snapshot }),

  // Theme
  theme: localStorage.getItem('infininote-theme') || 'dark',
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('infininote-theme', newTheme)
    return { theme: newTheme }
  }),
}))

export default useStore
