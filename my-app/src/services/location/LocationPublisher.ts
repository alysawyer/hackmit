// src/services/location/LocationPublisher.ts
import * as Location from 'expo-location';
import { ref, set } from 'firebase/database';
import { db } from '../firebase';

type Coords = { lat: number; lng: number };

export class LocationPublisher {
  private userId: string;
  private watchSub: Location.LocationSubscription | null = null;
  private isRunning = false;

  constructor(userId: string) {
    this.userId = userId;
  }

  async start(): Promise<void> {
    if (this.isRunning) return;

    // Request location permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission denied');
    }

    // Start watching position
    this.watchSub = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 3000, // 3 seconds
        distanceInterval: 5, // 5 meters
      },
      async (loc) => {
        const coords: Coords = {
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
        };

        try {
          // Update location in Firebase RTDB
          await set(ref(db, `locations/${this.userId}`), {
            ...coords,
            updatedAt: Date.now(),
          });
        } catch (error) {
          console.error('Failed to update location in Firebase:', error);
        }
      }
    );

    this.isRunning = true;
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    await this.watchSub?.remove();
    this.watchSub = null;
    this.isRunning = false;
  }

  isPublishing(): boolean {
    return this.isRunning;
  }
}
