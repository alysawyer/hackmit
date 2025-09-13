// src/adapters/EncounterAdapter.ts

export type PeerId = string;

export type EncounterEvent = {
  type: 'ENTER' | 'DWELL' | 'EXIT';
  peerId: PeerId;
  distanceMeters?: number;
  occurredAt: number; // epoch ms
};

export type EncounterEventHandler = (event: EncounterEvent) => void;
export type Unsubscribe = () => void;

export interface EncounterAdapter {
  start(): Promise<void>;
  stop(): Promise<void>;
  subscribe(handler: EncounterEventHandler): Unsubscribe;
}
