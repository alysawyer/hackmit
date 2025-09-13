// src/store/collectionStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PeerId, EncounterEvent } from '../adapters/EncounterAdapter';
import { Character, characterFromPeerId } from '../features/encounters/characterGen';

export type CollectionEntry = {
  peerId: PeerId;
  character: Character;
  firstMetAt: number;
  lastSeenAt: number;
  encounters: number;
};

type CollectionStore = {
  entries: Map<PeerId, CollectionEntry>;
  lastEncounterTimes: Map<PeerId, number>;
  recentEncounters: CollectionEntry[];
  
  // Actions
  addOrUpdateFromEncounter: (event: EncounterEvent) => Promise<{ isNew: boolean; character: Character } | null>;
  getByPeer: (peerId: PeerId) => CollectionEntry | undefined;
  all: () => CollectionEntry[];
  deleteEntry: (peerId: PeerId) => void;
  clearRecentEncounters: () => void;
  reset: () => void;
};

const COOLDOWN_MS = 60 * 1000; // 60 seconds
const MAX_RECENT_ENCOUNTERS = 5;

export const useCollectionStore = create<CollectionStore>()(
  persist(
    (set, get) => ({
      entries: new Map(),
      lastEncounterTimes: new Map(),
      recentEncounters: [],

      addOrUpdateFromEncounter: async (event: EncounterEvent) => {
        // Only process ENTER and DWELL events
        if (event.type === 'EXIT') return null;

        const { entries, lastEncounterTimes } = get();
        
        // Check cooldown
        const lastTime = lastEncounterTimes.get(event.peerId);
        if (lastTime && (event.occurredAt - lastTime) < COOLDOWN_MS) {
          return null; // Within cooldown period
        }

        // Generate or retrieve character
        const existingEntry = entries.get(event.peerId);
        const character = existingEntry?.character || await characterFromPeerId(event.peerId);
        
        const isNew = !existingEntry;
        
        // Create or update entry
        const updatedEntry: CollectionEntry = existingEntry ? {
          ...existingEntry,
          lastSeenAt: event.occurredAt,
          encounters: existingEntry.encounters + 1,
        } : {
          peerId: event.peerId,
          character,
          firstMetAt: event.occurredAt,
          lastSeenAt: event.occurredAt,
          encounters: 1,
        };

        // Update store
        set((state) => {
          const newEntries = new Map(state.entries);
          newEntries.set(event.peerId, updatedEntry);
          
          const newLastTimes = new Map(state.lastEncounterTimes);
          newLastTimes.set(event.peerId, event.occurredAt);
          
          // Update recent encounters
          let newRecent = [...state.recentEncounters];
          // Remove if already in recent
          newRecent = newRecent.filter(e => e.peerId !== event.peerId);
          // Add to front
          newRecent.unshift(updatedEntry);
          // Limit size
          newRecent = newRecent.slice(0, MAX_RECENT_ENCOUNTERS);
          
          return {
            entries: newEntries,
            lastEncounterTimes: newLastTimes,
            recentEncounters: newRecent,
          };
        });

        return { isNew, character };
      },

      getByPeer: (peerId: PeerId) => {
        return get().entries.get(peerId);
      },

      all: () => {
        const entries = get().entries;
        return Array.from(entries.values()).sort((a, b) => b.lastSeenAt - a.lastSeenAt);
      },

      deleteEntry: (peerId: PeerId) => {
        set((state) => {
          const newEntries = new Map(state.entries);
          newEntries.delete(peerId);
          
          const newLastTimes = new Map(state.lastEncounterTimes);
          newLastTimes.delete(peerId);
          
          const newRecent = state.recentEncounters.filter(e => e.peerId !== peerId);
          
          return {
            entries: newEntries,
            lastEncounterTimes: newLastTimes,
            recentEncounters: newRecent,
          };
        });
      },

      clearRecentEncounters: () => {
        set((state) => ({
          ...state,
          recentEncounters: [],
        }));
      },

      reset: () => {
        set({
          entries: new Map(),
          lastEncounterTimes: new Map(),
          recentEncounters: [],
        });
        // Clear the persisted storage as well
        AsyncStorage.removeItem('collection-storage').catch(console.error);
      },
    }),
    {
      name: 'collection-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist entries, reconstruct other fields
        entries: Array.from(state.entries.entries()),
        recentEncounters: state.recentEncounters,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray((state as any).entries)) {
          // Convert array back to Map
          (state as any).entries = new Map((state as any).entries);
        }
        // Ensure we always have the required Maps initialized
        if (state) {
          if (!state.lastEncounterTimes) {
            state.lastEncounterTimes = new Map();
          }
          if (!state.recentEncounters) {
            state.recentEncounters = [];
          }
        }
      },
    }
  )
);
