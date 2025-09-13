import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface ProximityAlert {
  isNearby: boolean;
  distance?: number;
  lastUpdate: number;
}

class LocationService {
  private watchId: Location.LocationSubscription | null = null;
  private currentLocation: LocationData | null = null;
  private proximityThreshold = 50; // meters
  private onProximityChange?: (alert: ProximityAlert) => void;
  private lastProximityCheck = 0;
  private proximityCheckInterval = 5000; // Check proximity every 5 seconds max

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  async startLocationTracking(onProximityChange: (alert: ProximityAlert) => void): Promise<boolean> {
    // Stop any existing tracking first
    this.stopLocationTracking();
    
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      return false;
    }

    this.onProximityChange = onProximityChange;

    try {
      // Get initial location with balanced accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      this.currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: Date.now(),
      };

      // Trigger initial proximity check
      this.checkProximity();

      // Start watching location changes with less frequent updates
      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000, // Update every 10 seconds (less frequent)
          distanceInterval: 50, // Update every 50 meters (less sensitive)
        },
        (location) => {
          try {
            this.updateLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              timestamp: Date.now(),
            });
          } catch (error) {
            console.error('Error updating location:', error);
          }
        }
      );

      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }

  stopLocationTracking(): void {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
    this.onProximityChange = undefined;
  }

  private updateLocation(newLocation: LocationData): void {
    this.currentLocation = newLocation;
    this.checkProximity();
  }

  private checkProximity(): void {
    if (!this.currentLocation || !this.onProximityChange) return;

    const now = Date.now();
    // Debounce proximity checks to prevent too frequent updates
    if (now - this.lastProximityCheck < this.proximityCheckInterval) {
      return;
    }
    
    this.lastProximityCheck = now;

    // For demo purposes, we'll simulate proximity detection
    // In a real app, you'd compare with other devices' locations
    const isNearby = this.simulateProximityDetection();
    
    this.onProximityChange({
      isNearby,
      distance: isNearby ? Math.random() * this.proximityThreshold : undefined,
      lastUpdate: now,
    });
  }

  private simulateProximityDetection(): boolean {
    // Simulate random proximity detection for demo
    // In a real app, this would check against a database of other device locations
    return Math.random() < 0.3; // 30% chance of detecting nearby device
  }

  getCurrentLocation(): LocationData | null {
    return this.currentLocation;
  }

  setProximityThreshold(threshold: number): void {
    this.proximityThreshold = threshold;
  }
}

export default new LocationService();
