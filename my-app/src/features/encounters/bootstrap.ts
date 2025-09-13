// src/features/encounters/bootstrap.ts
import { EventBusEncounterAdapter } from '../../adapters/EventBusEncounterAdapter';
import { ensureAnonAuth } from '../../services/firebase';
import { LocationPublisher } from '../../services/location/LocationPublisher';
import { FirebaseProximityEngine } from '../../services/proximity/FirebaseProximityEngine';
import * as Location from 'expo-location';

export type EncounterMode = 'mock' | 'eventbus' | 'firebase';

export class EncounterRuntime {
  private mode: EncounterMode;
  private bus = new EventBusEncounterAdapter();
  private pub?: LocationPublisher;
  private prox?: FirebaseProximityEngine;
  private locationWatcher?: Location.LocationSubscription;
  private userId?: string;

  constructor(mode: EncounterMode) {
    this.mode = mode;
  }

  async start(): Promise<void> {
    // Always start the EventBus adapter to consume encounter events
    await this.bus.start();

    if (this.mode === 'firebase') {
      try {
        // Ensure anonymous authentication
        this.userId = await ensureAnonAuth();

        // Initialize Firebase components
        this.pub = new LocationPublisher(this.userId);
        this.prox = new FirebaseProximityEngine(this.userId);

        // Start location publishing
        await this.pub.start();

        // Seed proximity engine with current location
        const currentPos = await Location.getLastKnownPositionAsync({
          requiredAccuracy: 1000, // 1km accuracy is fine for seeding
        });
        
        if (currentPos) {
          this.prox.setMyLocation(currentPos.coords.latitude, currentPos.coords.longitude);
        }

        // Start proximity engine
        this.prox.start();

        // Start location watching to keep proximity engine updated
        this.locationWatcher = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 3000, // 3 seconds
            distanceInterval: 5, // 5 meters
          },
          (loc) => {
            this.prox?.setMyLocation(loc.coords.latitude, loc.coords.longitude);
          }
        );

        console.log(`Firebase encounter runtime started with userId: ${this.userId}`);
      } catch (error) {
        console.error('Failed to start Firebase encounter runtime:', error);
        throw error;
      }
    }
  }

  async stop(): Promise<void> {
    // Stop EventBus adapter
    await this.bus.stop();

    // Stop Firebase components if running
    if (this.mode === 'firebase') {
      await this.pub?.stop();
      this.prox?.stop();
      await this.locationWatcher?.remove();
      this.locationWatcher = undefined;
    }

    console.log(`${this.mode} encounter runtime stopped`);
  }

  getMode(): EncounterMode {
    return this.mode;
  }

  getUserId(): string | undefined {
    return this.userId;
  }

  getStatus(): {
    mode: EncounterMode;
    userId?: string;
    busRunning: boolean;
    publisherRunning: boolean;
    engineRunning: boolean;
  } {
    return {
      mode: this.mode,
      userId: this.userId,
      busRunning: this.bus ? true : false,
      publisherRunning: this.pub?.isPublishing() ?? false,
      engineRunning: this.prox?.isEngineRunning() ?? false,
    };
  }
}
