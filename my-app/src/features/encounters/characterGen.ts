// src/features/encounters/characterGen.ts

import * as Crypto from 'expo-crypto';
import { PeerId } from '../../adapters/EncounterAdapter';

export type Character = {
  id: string;           // equals peerId for MVP
  seed: string;         // derived from peerId (hash)
  species: 'fish';
  variantIndex: number; // 0..7 pick from assets
  colorHex: string;     // derived from seed
  nickname?: string;
};

const FISH_VARIANT_COUNT = 8;

export async function characterFromPeerId(peerId: PeerId, customName?: string): Promise<Character> {
  // Generate SHA-256 hash of peerId for deterministic seed
  const seed = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    peerId,
    { encoding: Crypto.CryptoEncoding.HEX }
  );

  // Use first bytes of hash to determine variant
  const variantByte = parseInt(seed.substring(0, 2), 16);
  const variantIndex = variantByte % FISH_VARIANT_COUNT;

  // Use middle bytes for color
  const colorR = parseInt(seed.substring(8, 10), 16);
  const colorG = parseInt(seed.substring(10, 12), 16);
  const colorB = parseInt(seed.substring(12, 14), 16);
  const colorHex = `#${seed.substring(8, 14).toUpperCase()}`;

  // Use custom name if provided, otherwise generate nickname based on peerId
  let nickname: string;
  
  if (customName) {
    nickname = customName;
  } else {
    // Try to extract name from peerId if it contains a name (format: "name:deviceId")
    const parts = peerId.split(':');
    if (parts.length >= 2) {
      nickname = parts[0];
    } else {
      // Generate a default nickname based on the hash
      const nicknameAdjectives = ['Swift', 'Gentle', 'Brave', 'Wise', 'Happy', 'Curious', 'Playful', 'Calm'];
      const nicknameNouns = ['Fin', 'Wave', 'Bubble', 'Current', 'Reef', 'Tide', 'Pearl', 'Coral'];
      
      const adjIndex = parseInt(seed.substring(16, 18), 16) % nicknameAdjectives.length;
      const nounIndex = parseInt(seed.substring(18, 20), 16) % nicknameNouns.length;
      nickname = `${nicknameAdjectives[adjIndex]} ${nicknameNouns[nounIndex]}`;
    }
  }

  return {
    id: peerId,
    seed,
    species: 'fish',
    variantIndex,
    colorHex,
    nickname,
  };
}

// Synchronous version for immediate UI feedback (less secure but ok for MVP)
export function characterFromPeerIdSync(peerId: PeerId, customName?: string): Character {
  // Simple hash function for synchronous generation
  let hash = 0;
  for (let i = 0; i < peerId.length; i++) {
    const char = peerId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  const seed = Math.abs(hash).toString(16).padStart(64, '0');
  
  const variantByte = parseInt(seed.substring(0, 2), 16);
  const variantIndex = variantByte % FISH_VARIANT_COUNT;
  
  const colorHex = `#${seed.substring(8, 14).toUpperCase()}`;
  
  // Use custom name if provided, otherwise generate nickname based on peerId
  let nickname: string;
  
  if (customName) {
    nickname = customName;
  } else {
    // Try to extract name from peerId if it contains a name (format: "name:deviceId")
    const parts = peerId.split(':');
    if (parts.length >= 2) {
      nickname = parts[0];
    } else {
      // Generate a default nickname based on the hash
      const nicknameAdjectives = ['Swift', 'Gentle', 'Brave', 'Wise', 'Happy', 'Curious', 'Playful', 'Calm'];
      const nicknameNouns = ['Fin', 'Wave', 'Bubble', 'Current', 'Reef', 'Tide', 'Pearl', 'Coral'];
      
      const adjIndex = parseInt(seed.substring(16, 18), 16) % nicknameAdjectives.length;
      const nounIndex = parseInt(seed.substring(18, 20), 16) % nicknameNouns.length;
      nickname = `${nicknameAdjectives[adjIndex]} ${nicknameNouns[nounIndex]}`;
    }
  }

  return {
    id: peerId,
    seed,
    species: 'fish',
    variantIndex,
    colorHex,
    nickname,
  };
}
