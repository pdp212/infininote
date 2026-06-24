/**
 * useStore.js — Zustand global state cho InfiniNote
 */
import { create } from 'zustand'

const useStore = create((set) => ({
  // Auth
  isUnlocked: false,
  unlock: () => set({ isUnlocked: true }),

  // WebSocket connection
  connectionStatus: 'connecting', // 'connecting' | 'connected' | 'offline'
  setConnectionStatus: (status) => set({ connectionStatus: status }),

  // Save state
  saveStatus: 'saved', // 'saved' | 'saving' | 'error'
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
}))

export default useStore
