// src/store/settingsStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EncounterMode } from '../features/encounters/bootstrap';

type SettingsStore = {
  encounterMode: EncounterMode;
  isAdapterRunning: boolean;
  userId?: string;
  userName?: string;
  hasCompletedOnboarding: boolean;
  
  // Actions
  setEncounterMode: (mode: EncounterMode) => void;
  setAdapterRunning: (running: boolean) => void;
  setUserId: (userId?: string) => void;
  setUserName: (userName?: string) => void;
  setHasCompletedOnboarding: (completed: boolean) => void;
  
  // Legacy compatibility
  get isDebugMode(): boolean;
  setDebugMode: (enabled: boolean) => void;
  toggleDebugMode: () => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      encounterMode: __DEV__ ? 'mock' : 'firebase', // Default to mock in dev, firebase in prod
      isAdapterRunning: false,
      userId: undefined,
      userName: undefined,
      hasCompletedOnboarding: false,

      setEncounterMode: (mode: EncounterMode) => {
        set({ encounterMode: mode });
      },

      setAdapterRunning: (running: boolean) => {
        set({ isAdapterRunning: running });
      },

      setUserId: (userId?: string) => {
        set({ userId });
      },

      setUserName: (userName?: string) => {
        set({ userName });
      },

      setHasCompletedOnboarding: (completed: boolean) => {
        set({ hasCompletedOnboarding: completed });
      },

      // Legacy compatibility for existing code
      get isDebugMode(): boolean {
        return get().encounterMode === 'mock';
      },

      setDebugMode: (enabled: boolean) => {
        set({ encounterMode: enabled ? 'mock' : 'firebase' });
      },

      toggleDebugMode: () => {
        const current = get().encounterMode;
        set({ encounterMode: current === 'mock' ? 'firebase' : 'mock' });
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Persist user preferences
        encounterMode: state.encounterMode,
        userName: state.userName,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    }
  )
);
