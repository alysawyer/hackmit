// assets/images/character_sprites/index.ts
import body1 from './body1.png';
import body2 from './body2.png';
import body3 from './body3.png';
import body4 from './body4.png';
import face1 from './face1.png';
import face2 from './face2.png';
import face3 from './face3.png';

export const characterSprites = {
  body: {
    body1,
    body2,
    body3,
    body4
  },
  face: {
    face1,
    face2,
    face3,
  }
};

// Helper to convert to array format
export const getFeatures = () => ({
  body: Object.entries(characterSprites.body).map(([id, source]) => ({
    id,
    source
  })),
  face: Object.entries(characterSprites.face).map(([id, source]) => ({
    id,
    source
  })),
  color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
});