// src/adapters/EventBusEncounterAdapter.ts

import { DeviceEventEmitter, EmitterSubscription } from 'react-native';
import { EncounterAdapter, EncounterEvent, EncounterEventHandler, Unsubscribe } from './EncounterAdapter';

export class EventBusEncounterAdapter implements EncounterAdapter {
  private handlers: Set<EncounterEventHandler> = new Set();
  private subscription: EmitterSubscription | null = null;
  private isRunning = false;

  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    // Listen for EncounterEvent from DeviceEventEmitter
    // The real proximity layer will emit events with this name
    this.subscription = DeviceEventEmitter.addListener('EncounterEvent', (event: unknown) => {
      if (this.isValidEncounterEvent(event)) {
        this.handleIncomingEvent(event);
      } else {
        console.warn('Invalid EncounterEvent received:', event);
      }
    });
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;
    this.isRunning = false;

    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
  }

  subscribe(handler: EncounterEventHandler): Unsubscribe {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  private isValidEncounterEvent(event: unknown): event is EncounterEvent {
    if (!event || typeof event !== 'object') return false;
    const e = event as any;
    
    return (
      typeof e.type === 'string' &&
      ['ENTER', 'DWELL', 'EXIT'].includes(e.type) &&
      typeof e.peerId === 'string' &&
      typeof e.occurredAt === 'number' &&
      (e.distanceMeters === undefined || typeof e.distanceMeters === 'number')
    );
  }

  private handleIncomingEvent(event: EncounterEvent): void {
    if (!this.isRunning) return;
    
    this.handlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error('Error in encounter handler:', error);
      }
    });
  }
}
