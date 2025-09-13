// src/screens/HomeScreen.tsx

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCollectionStore } from '../store/collectionStore';
import { useSettingsStore } from '../store/settingsStore';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { encounterService } from '../features/encounters/encounterService';
import { formatTimeAgo } from '../utils/time';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const recentEncounters = useCollectionStore((state) => state.recentEncounters);
  const deleteEntry = useCollectionStore((state) => state.deleteEntry);
  const clearRecentEncounters = useCollectionStore((state) => state.clearRecentEncounters);
  const isDebugMode = useSettingsStore((state) => state.isDebugMode);
  const isAdapterRunning = useSettingsStore((state) => state.isAdapterRunning);

  useEffect(() => {
    // Start encounter service when screen mounts
    if (!isAdapterRunning) {
      encounterService.start();
    }
  }, [isAdapterRunning]);

  const handleSimulateEncounter = () => {
    const mockAdapter = encounterService.getMockAdapter();
    if (mockAdapter) {
      mockAdapter.triggerEncounter();
    }
  };

  const handleFreshStart = () => {
    Alert.alert(
      'Start Fresh Session',
      'This will reset your collection and start a new encounter session. All previous fish will be cleared.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Fresh',
          style: 'default',
          onPress: () => {
            useCollectionStore.getState().reset();
            Alert.alert('Fresh Start', 'Collection reset! Ready for new encounters.');
          },
        },
      ]
    );
  };

  const handleDeleteEncounter = (entry: any) => {
    Alert.alert(
      'Delete Encounter',
      `Remove ${entry.character.nickname || entry.peerId} from your collection?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteEntry(entry.peerId),
        },
      ]
    );
  };

  const handleClearAllEncounters = () => {
    if (recentEncounters.length === 0) return;
    
    Alert.alert(
      'Clear Recent Encounters',
      'Remove all recent encounters? (This will not delete them from your collection)',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => clearRecentEncounters(),
        },
      ]
    );
  };

  const renderRecentEncounter = (entry: any) => (
    <TouchableOpacity
      key={entry.peerId}
      style={styles.encounterCard}
      onPress={() => navigation.navigate('PeerDetail', { peerId: entry.peerId })}
      onLongPress={() => handleDeleteEncounter(entry)}
      delayLongPress={500}
    >
      <CharacterAvatar character={entry.character} size={60} />
      <View style={styles.encounterInfo}>
        <Text style={styles.encounterName}>
          {entry.character.nickname || entry.peerId}
        </Text>
        <Text style={styles.encounterTime}>
          {formatTimeAgo(entry.lastSeenAt)}
        </Text>
        <Text style={styles.deleteHint}>Long press to delete</Text>
      </View>
      <View style={styles.encounterStats}>
        <Text style={styles.encounterCount}>{entry.encounters}x</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Nearby Encounters</Text>
          <Text style={styles.subtitle}>
            {isAdapterRunning ? 'Scanning for nearby friends...' : 'Service stopped'}
          </Text>
        </View>

        {isDebugMode && (
          <View style={styles.debugSection}>
            <Text style={styles.debugTitle}>Debug Mode</Text>
            <View style={styles.debugButtonContainer}>
              <TouchableOpacity
                style={styles.simulateButton}
                onPress={handleSimulateEncounter}
              >
                <Text style={styles.simulateButtonText}>Simulate Encounter</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.freshStartButton}
                onPress={handleFreshStart}
              >
                <Text style={styles.freshStartButtonText}>Fresh Start</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Encounters</Text>
            {recentEncounters.length > 0 && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={handleClearAllEncounters}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
          {recentEncounters.length > 0 ? (
            recentEncounters.map(renderRecentEncounter)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No encounters yet</Text>
              <Text style={styles.emptySubtext}>
                Walk around to meet new friends!
              </Text>
            </View>
          )}
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {useCollectionStore.getState().all().length}
            </Text>
            <Text style={styles.statLabel}>Total Friends</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {recentEncounters.reduce((sum, e) => sum + e.encounters, 0)}
            </Text>
            <Text style={styles.statLabel}>Total Encounters</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  debugSection: {
    margin: 20,
    padding: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 10,
  },
  debugButtonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  simulateButton: {
    backgroundColor: '#ffc107',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  simulateButtonText: {
    color: '#856404',
    fontWeight: 'bold',
  },
  freshStartButton: {
    backgroundColor: '#17a2b8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  freshStartButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  recentSection: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  encounterCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  encounterInfo: {
    flex: 1,
    marginLeft: 12,
  },
  encounterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  encounterTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  deleteHint: {
    fontSize: 10,
    color: '#ccc',
    marginTop: 1,
    fontStyle: 'italic',
  },
  encounterStats: {
    alignItems: 'center',
  },
  encounterCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
