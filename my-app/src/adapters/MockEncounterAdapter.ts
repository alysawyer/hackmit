// src/adapters/MockEncounterAdapter.ts

import { EncounterAdapter, EncounterEvent, EncounterEventHandler, Unsubscribe } from './EncounterAdapter';

// Generate realistic mock peer IDs with names
const MOCK_NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Emma', 'Frank', 'Grace', 'Henry', 'Iris', 'Justin'];
const MOCK_PEER_POOL = MOCK_NAMES.map((name, index) => `${name}:mock-${index + 1}`);

export class MockEncounterAdapter implements EncounterAdapter {
  private handlers: Set<EncounterEventHandler> = new Set();
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    // Emit random encounters every 10-20 seconds
    this.intervalId = setInterval(() => {
      this.emitRandomEncounter();
    }, 10000 + Math.random() * 10000);
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  subscribe(handler: EncounterEventHandler): Unsubscribe {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  // Public method for manual trigger from debug UI
  triggerEncounter(peerId?: string): void {
    const selectedPeerId = peerId || MOCK_PEER_POOL[Math.floor(Math.random() * MOCK_PEER_POOL.length)];
    const event: EncounterEvent = {
      type: 'ENTER',
      peerId: selectedPeerId,
      distanceMeters: 5 + Math.random() * 15,
      occurredAt: Date.now(),
    };
    this.emit(event);

    // Simulate DWELL after 2 seconds
    setTimeout(() => {
      if (this.isRunning) {
        this.emit({
          ...event,
          type: 'DWELL',
          occurredAt: Date.now(),
        });
      }
    }, 2000);

    // Simulate EXIT after 10 seconds
    setTimeout(() => {
      if (this.isRunning) {
        this.emit({
          ...event,
          type: 'EXIT',
          occurredAt: Date.now(),
        });
      }
    }, 10000);
  }

  private emitRandomEncounter(): void {
    if (!this.isRunning) return;
    this.triggerEncounter();
  }

  private emit(event: EncounterEvent): void {
    this.handlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error('Error in encounter handler:', error);
      }
    });
  }
}
