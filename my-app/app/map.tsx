import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

interface Landmark {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  icon: keyof typeof Ionicons.glyphMap;
  collected: boolean;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

const LANDMARKS: Landmark[] = [
  {
    id: '1',
    name: 'MIT Dome',
    latitude: 42.3601,
    longitude: -71.0942,
    icon: 'school',
    collected: false,
  },
  {
    id: '2',
    name: 'Charles River',
    latitude: 42.3551,
    longitude: -71.0656,
    icon: 'water',
    collected: false,
  },
  {
    id: '3',
    name: 'Boston Common',
    latitude: 42.3551,
    longitude: -71.0656,
    icon: 'leaf',
    collected: false,
  },
  {
    id: '4',
    name: 'Fenway Park',
    latitude: 42.3467,
    longitude: -71.0972,
    icon: 'baseball',
    collected: false,
  },
];

const COLLECTION_DISTANCE = 100; // meters

export default function MapPage() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [landmarks, setLandmarks] = useState<Landmark[]>(LANDMARKS);
  const [collectedStamps, setCollectedStamps] = useState<number>(0);

  useEffect(() => {
    getLocationPermission();
  }, []);

  const getLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to use the map.');
        return;
      }
      getCurrentLocation();
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const checkLandmarkCollection = () => {
    if (!userLocation) return;

    const updatedLandmarks = landmarks.map(landmark => {
      if (landmark.collected) return landmark;

      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        landmark.latitude,
        landmark.longitude
      );

      if (distance <= COLLECTION_DISTANCE) {
        Alert.alert(
          'Stamp Collected! 🎉',
          `You've collected a stamp for ${landmark.name}!`,
          [{ text: 'Awesome!', style: 'default' }]
        );
        return { ...landmark, collected: true };
      }
      return landmark;
    });

    setLandmarks(updatedLandmarks);
    setCollectedStamps(updatedLandmarks.filter(l => l.collected).length);
  };

  useEffect(() => {
    checkLandmarkCollection();
  }, [userLocation]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Map & Stamps</Text>
        <View style={styles.stampCounter}>
          <Ionicons name="bookmark" size={20} color="#4CAF50" />
          <Text style={styles.stampText}>{collectedStamps}/{landmarks.length}</Text>
        </View>
      </View>

      {userLocation ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {/* User location circle */}
          <Circle
            center={userLocation}
            radius={COLLECTION_DISTANCE}
            strokeColor="rgba(76, 175, 80, 0.3)"
            fillColor="rgba(76, 175, 80, 0.1)"
          />

          {/* Landmark markers */}
          {landmarks.map((landmark) => (
            <Marker
              key={landmark.id}
              coordinate={{
                latitude: landmark.latitude,
                longitude: landmark.longitude,
              }}
              title={landmark.name}
              description={landmark.collected ? '✅ Collected!' : 'Tap to collect stamp'}
            >
              <View style={[
                styles.markerContainer,
                landmark.collected && styles.collectedMarker
              ]}>
                <Ionicons
                  name={landmark.icon}
                  size={24}
                  color={landmark.collected ? '#4CAF50' : '#FF5722'}
                />
                {landmark.collected && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark" size={12} color="white" />
                  </View>
                )}
              </View>
            </Marker>
          ))}
        </MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your location...</Text>
          <TouchableOpacity style={styles.button} onPress={getLocationPermission}>
            <Text style={styles.buttonText}>Enable Location</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend:</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendMarker, { backgroundColor: '#FF5722' }]} />
          <Text style={styles.legendText}>Uncollected Landmark</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendMarker, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Collected Landmark</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendMarker, { backgroundColor: 'rgba(76, 175, 80, 0.3)' }]} />
          <Text style={styles.legendText}>Collection Range</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  stampCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  stampText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF5722',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  collectedMarker: {
    borderColor: '#4CAF50',
  },
  checkmark: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  legend: {
    backgroundColor: 'white',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
});
