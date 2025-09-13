// src/screens/PeerDetailScreen.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useCollectionStore } from '../store/collectionStore';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { formatDate, formatTimeAgo } from '../utils/time';

type PeerDetailRouteParams = {
  PeerDetail: {
    peerId: string;
  };
};

export const PeerDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<PeerDetailRouteParams, 'PeerDetail'>>();
  const { peerId } = route.params;
  const entry = useCollectionStore((state) => state.getByPeer(peerId));

  if (!entry) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Character not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <CharacterAvatar character={entry.character} size={120} />
          <Text style={styles.name}>
            {entry.character.nickname || entry.peerId}
          </Text>
          <Text style={styles.peerId}>ID: {entry.peerId}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{entry.encounters}</Text>
            <Text style={styles.statLabel}>Encounters</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatTimeAgo(entry.lastSeenAt)}</Text>
            <Text style={styles.statLabel}>Last Seen</Text>
          </View>
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Character Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Species:</Text>
            <Text style={styles.detailValue}>{entry.character.species}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Variant:</Text>
            <Text style={styles.detailValue}>Type {entry.character.variantIndex + 1}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Color:</Text>
            <View style={styles.colorRow}>
              <View style={[styles.colorSwatch, { backgroundColor: entry.character.colorHex }]} />
              <Text style={styles.detailValue}>{entry.character.colorHex}</Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Encounter History</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>First Met:</Text>
            <Text style={styles.detailValue}>{formatDate(entry.firstMetAt)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Last Seen:</Text>
            <Text style={styles.detailValue}>{formatDate(entry.lastSeenAt)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Encounters:</Text>
            <Text style={styles.detailValue}>{entry.encounters}</Text>
          </View>
        </View>

        <View style={styles.seedSection}>
          <Text style={styles.seedLabel}>Character Seed</Text>
          <Text style={styles.seedValue} numberOfLines={2}>
            {entry.character.seed}
          </Text>
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
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  peerId: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  detailsSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  seedSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  seedLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  seedValue: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'Courier',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#999',
  },
});
