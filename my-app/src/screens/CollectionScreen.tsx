// src/screens/CollectionScreen.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCollectionStore, CollectionEntry } from '../store/collectionStore';
import { CharacterAvatar } from '../components/CharacterAvatar';

const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEM_SIZE = (SCREEN_WIDTH - 48) / 3; // 3 columns with padding

export const CollectionScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const entries = useCollectionStore((state) => 
    Array.from(state.entries.values()).sort((a, b) => b.lastSeenAt - a.lastSeenAt)
  );

  const renderItem = ({ item }: { item: CollectionEntry }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => navigation.navigate('PeerDetail', { peerId: item.peerId })}
    >
      <CharacterAvatar character={item.character} size={ITEM_SIZE - 32} />
      <Text style={styles.itemName} numberOfLines={1}>
        {item.character.nickname || item.peerId}
      </Text>
      <Text style={styles.itemCount}>{item.encounters}x</Text>
    </TouchableOpacity>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Characters Yet</Text>
      <Text style={styles.emptySubtext}>
        Start exploring to meet new friends!
      </Text>
    </View>
  );

  const ListHeaderComponent = () => (
    <View style={styles.header}>
      <Text style={styles.title}>My Collection</Text>
      <Text style={styles.subtitle}>
        {entries.length} {entries.length === 1 ? 'character' : 'characters'} collected
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={entries}
        renderItem={renderItem}
        keyExtractor={(item) => item.peerId}
        numColumns={3}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={entries.length > 0 ? styles.row : undefined}
        ListEmptyComponent={ListEmptyComponent}
        ListHeaderComponent={ListHeaderComponent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 12,
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
  row: {
    paddingHorizontal: 12,
  },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE + 40,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
    width: '100%',
  },
  itemCount: {
    fontSize: 10,
    color: '#4CAF50',
    marginTop: 2,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
  },
});
