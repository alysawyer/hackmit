// src/services/proximity/FirebaseProximityEngine.ts
import { onValue, ref } from 'firebase/database';
import { db } from '../firebase';
import { DeviceEventEmitter } from 'react-native';
import haversine from 'haversine-distance';

type LocMap = Record<string, { lat: number; lng: number; updatedAt: number }>;
type MyLoc = { lat: number; lng: number } | null;

export class FirebaseProximityEngine {
  private userId: string;
  private myLoc: MyLoc = null;
  private unsub?: () => void;
  private lastSeenMs = new Map<string, number>(); // peerId -> last ENTER ms
  private readonly ENTER_COOLDOWN_MS = 60_000; // 1 minute cooldown
  private readonly MAX_AGE_MS = 30_000; // ignore stale peers (30 seconds)
  private readonly PROXIMITY_THRESHOLD_METERS = 20; // 20 meters
  private isRunning = false;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Call this to update the engine's knowledge of our location
  setMyLocation(lat: number, lng: number): void {
    this.myLoc = { lat, lng };
  }

  start(): void {
    if (this.isRunning) return;

    const locationsRef = ref(db, 'locations');
    const off = onValue(
      locationsRef,
      (snap) => {
        const data: LocMap = snap.val() || {};
        if (!this.myLoc) return;

        this.processLocationUpdates(data);
      },
      (error) => {
        console.error('Firebase proximity engine error:', error);
      }
    );

    this.unsub = off;
    this.isRunning = true;
  }

  stop(): void {
    if (!this.isRunning) return;

    this.unsub?.();
    this.unsub = undefined;
    this.lastSeenMs.clear();
    this.isRunning = false;
  }

  isEngineRunning(): boolean {
    return this.isRunning;
  }

  private processLocationUpdates(data: LocMap): void {
    if (!this.myLoc) return;

    const now = Date.now();

    Object.entries(data).forEach(([peerId, peerLoc]) => {
      // Skip own location
      if (peerId === this.userId) return;

      // Validate peer location data
      if (!peerLoc?.lat || !peerLoc?.lng || !peerLoc?.updatedAt) return;

      // Skip stale locations
      if (now - peerLoc.updatedAt > this.MAX_AGE_MS) return;

      // Calculate distance
      const distance = haversine(
        { lat: this.myLoc!.lat, lon: this.myLoc!.lng },
        { lat: peerLoc.lat, lon: peerLoc.lng }
      );

      // Check if peer is within proximity threshold
      if (distance <= this.PROXIMITY_THRESHOLD_METERS) {
        const lastSeen = this.lastSeenMs.get(peerId) ?? 0;
        
        // Check cooldown period
        if (now - lastSeen >= this.ENTER_COOLDOWN_MS) {
          this.lastSeenMs.set(peerId, now);
          
          // Emit encounter event
          DeviceEventEmitter.emit('EncounterEvent', {
            type: 'ENTER',
            peerId,
            occurredAt: now,
            distanceMeters: Math.round(distance),
          });
        }
      }
    });
  }
}
