// src/features/encounters/encounterService.ts

import { EncounterEvent, Unsubscribe } from '../../adapters/EncounterAdapter';
import { MockEncounterAdapter } from '../../adapters/MockEncounterAdapter';
import { useCollectionStore } from '../../store/collectionStore';
import { useSettingsStore } from '../../store/settingsStore';
import { EncounterRuntime, EncounterMode } from './bootstrap';
import { DeviceEventEmitter } from 'react-native';

export type ToastData = {
  peerId: string;
  character: any;
  timestamp: number;
};

class EncounterService {
  private runtime: EncounterRuntime | null = null;
  private toastQueue: ToastData[] = [];
  private toastHandler: ((toast: ToastData) => void) | null = null;
  private mockAdapter: MockEncounterAdapter | null = null;
  private unsubscribe: Unsubscribe | null = null;
  private maxQueueSize = 3;

  async initialize(): Promise<void> {
    const mode = useSettingsStore.getState().encounterMode;
    
    // Always start with mock mode for fast loading, can switch to Firebase later
    const safeMode: EncounterMode = mode === 'firebase' ? 'mock' : mode;
    
    // Create runtime based on current mode
    this.runtime = new EncounterRuntime(safeMode);
    
    // If mock mode, create a direct mock adapter for manual triggers
    if (safeMode === 'mock') {
      this.mockAdapter = new MockEncounterAdapter();
      this.unsubscribe = this.mockAdapter.subscribe(this.handleEncounterEvent);
    }
  }

  async start(): Promise<void> {
    if (!this.runtime) {
      await this.initialize();
    }

    if (this.runtime) {
      try {
        await this.runtime.start();
        
        // Start mock adapter if in mock mode
        if (this.mockAdapter) {
          await this.mockAdapter.start();
        }
        
        useSettingsStore.getState().setAdapterRunning(true);
        
        // Store user ID if available
        const userId = this.runtime.getUserId();
        if (userId) {
          useSettingsStore.getState().setUserId(userId);
        }
        
        console.log('✅ EncounterService started successfully');
      } catch (error) {
        console.error('❌ Failed to start EncounterService:', error);
        // Continue with mock mode even if Firebase fails
        if (this.mockAdapter) {
          await this.mockAdapter.start();
          useSettingsStore.getState().setAdapterRunning(true);
        }
      }
    }
  }

  async stop(): Promise<void> {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    if (this.mockAdapter) {
      await this.mockAdapter.stop();
      this.mockAdapter = null;
    }

    if (this.runtime) {
      try {
        await this.runtime.stop();
      } catch (error) {
        console.error('Error stopping runtime:', error);
      }
      useSettingsStore.getState().setAdapterRunning(false);
    }
  }

  async restart(): Promise<void> {
    await this.stop();
    this.runtime = null;
    await this.initialize();
    await this.start();
  }

  // Get mock adapter for manual testing
  getMockAdapter(): MockEncounterAdapter | null {
    return this.mockAdapter;
  }

  // Get runtime status for debugging
  getRuntimeStatus(): any {
    return this.runtime?.getStatus() || null;
  }

  // Manual encounter simulation (works in any mode)
  simulateEncounter(peerId?: string): void {
    let generatedPeerId: string;
    
    if (peerId) {
      generatedPeerId = peerId;
    } else {
      // Generate realistic simulated names for testing
      const mockNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Emma', 'Frank', 'Grace', 'Henry', 'Iris', 'Justin'];
      const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
      const deviceId = Math.floor(Math.random() * 1000);
      generatedPeerId = `${randomName}:dev-${deviceId}`;
    }
    
    DeviceEventEmitter.emit('EncounterEvent', {
      type: 'ENTER',
      peerId: generatedPeerId,
      occurredAt: Date.now(),
      distanceMeters: Math.floor(Math.random() * 15) + 5, // 5-20 meters
    });
    
    console.log('🎯 Simulated encounter:', generatedPeerId);
  }

  setToastHandler(handler: (toast: ToastData) => void): void {
    this.toastHandler = handler;
  }

  // Get the current user's peer ID including their name
  getCurrentUserPeerId(): string {
    const { userName, userId } = useSettingsStore.getState();
    const deviceId = userId || `device-${Date.now()}`;
    
    if (userName) {
      return `${userName}:${deviceId}`;
    }
    
    return deviceId;
  }

  private handleEncounterEvent = async (event: EncounterEvent): Promise<void> => {
    // Only process ENTER and first DWELL events
    if (event.type === 'EXIT') return;

    try {
      const store = useCollectionStore.getState();
      
      // Add or update the encounter in the store (handles cooldown internally)
      const result = await store.addOrUpdateFromEncounter(event);
      
      if (result && result.isNew && this.toastHandler) {
        // Queue toast for new encounters
        this.queueToast({
          peerId: event.peerId,
          character: result.character,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error('Error handling encounter event:', error);
    }
  };

  private queueToast(toast: ToastData): void {
    // Maintain queue size limit
    if (this.toastQueue.length >= this.maxQueueSize) {
      this.toastQueue.shift(); // Remove oldest
    }
    
    this.toastQueue.push(toast);
    
    // Notify handler if available
    if (this.toastHandler) {
      this.toastHandler(toast);
    }
  }

  getNextToast(): ToastData | null {
    return this.toastQueue.shift() || null;
  }
}

export const encounterService = new EncounterService();

// Legacy function for compatibility
export function simulateEncounter(peerId?: string): void {
  encounterService.simulateEncounter(peerId);
}