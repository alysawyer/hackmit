import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import locationService, { ProximityAlert } from '../services/locationService';

export default function Index() {
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [proximityAlert, setProximityAlert] = useState<ProximityAlert | null>(null);
  const [location, setLocation] = useState<string>('');

  useEffect(() => {
    return () => {
      locationService.stopLocationTracking();
    };
  }, []);

  const handleProximityChange = (alert: ProximityAlert) => {
    setProximityAlert(alert);
    
    if (alert.isNearby) {
      // Trigger haptic feedback when device is nearby
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const startTracking = async () => {
    if (isLoading) return; // Prevent multiple simultaneous requests
    
    setIsLoading(true);
    try {
      const success = await locationService.startLocationTracking(handleProximityChange);
      if (success) {
        setIsTracking(true);
        Alert.alert('Success', 'Location tracking started!');
      } else {
        Alert.alert('Error', 'Failed to start location tracking. Please check permissions.');
      }
    } catch (error) {
      console.error('Error starting tracking:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const stopTracking = () => {
    locationService.stopLocationTracking();
    setIsTracking(false);
    setProximityAlert(null);
  };

  const updateLocationDisplay = () => {
    const currentLocation = locationService.getCurrentLocation();
    if (currentLocation) {
      setLocation(`${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`);
    }
  };

  useEffect(() => {
    if (isTracking) {
      updateLocationDisplay();
      const interval = setInterval(updateLocationDisplay, 5000); // Update every 5 seconds instead of 2
      return () => clearInterval(interval);
    }
  }, [isTracking]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Proximity Detection</Text>
      
      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, { backgroundColor: isTracking ? '#4CAF50' : '#F44336' }]} />
        <Text style={styles.statusText}>
          {isTracking ? 'Tracking Active' : 'Tracking Inactive'}
        </Text>
      </View>

      {location && (
        <View style={styles.locationContainer}>
          <Text style={styles.locationLabel}>Current Location:</Text>
          <Text style={styles.locationText}>{location}</Text>
        </View>
      )}

      {proximityAlert && (
        <View style={[styles.alertContainer, { backgroundColor: proximityAlert.isNearby ? '#FFEB3B' : '#E0E0E0' }]}>
          <Text style={styles.alertText}>
            {proximityAlert.isNearby ? '🔔 Device Nearby!' : 'No nearby devices'}
          </Text>
          {proximityAlert.distance && (
            <Text style={styles.distanceText}>
              Distance: {proximityAlert.distance.toFixed(1)}m
            </Text>
          )}
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.button, 
          { 
            backgroundColor: isTracking ? '#F44336' : '#4CAF50',
            opacity: isLoading ? 0.6 : 1
          }
        ]}
        onPress={isTracking ? stopTracking : startTracking}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Starting...' : isTracking ? 'Stop Tracking' : 'Start Tracking'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Note: This demo simulates proximity detection. In a real app, this would compare your location with other devices.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  locationContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  locationLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  locationText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
  },
  alertContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  alertText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  note: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
});
