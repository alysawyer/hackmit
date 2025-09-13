import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  StyleSheet, 
  Dimensions 
} from 'react-native';


const { width, height } = Dimensions.get('window');
import CharacterRenderer from '@/components/CharacterRenderer';
import { getFeatures } from '@/assets/images/character_sprites';

type SelectedFeatures = {
  body: string;  // Store the ID of selected features
  face: string;  
  color: string;
};

type Feature = {
  id: string;
  source: any; // Image source
};

type Features = {
  body: Feature[];
  face: Feature[];
  color: string[];
};

const CharCreateScreen = () => {
  const [activeTab, setActiveTab] = useState<string>('body');
  const [selectedFeatures, setSelectedFeatures] = useState<SelectedFeatures>({
    body: 'body1',  // Store just the ID, not .png
    face: 'face1',  
    color: '#FF6B6B'
  });

  const features: Features = getFeatures(); 

  const handleFeatureSelect = (featureId: string) => {
    setSelectedFeatures(prev => ({
      ...prev,
      [activeTab]: featureId
    }));
  };

  const randomizeAvatar = () => {
    const randomBody = features.body[Math.floor(Math.random() * features.body.length)];
    const randomFace = features.face[Math.floor(Math.random() * features.face.length)];
    const randomColor = features.color[Math.floor(Math.random() * features.color.length)];
    
    setSelectedFeatures({
      body: randomBody.id,  // Use .id to get the string ID
      face: randomFace.id,  
      color: randomColor
    });
  };

  const renderFeatureButton = (feature: Feature | string) => {
    if (typeof feature === 'string') {
      // Handle color
      const isSelected = selectedFeatures[activeTab as keyof SelectedFeatures] === feature;
      return (
        <TouchableOpacity
          key={feature}
          style={[
            styles.colorButton,
            { backgroundColor: feature },
            isSelected && styles.selectedFeature
          ]}
          onPress={() => handleFeatureSelect(feature)}
        />
      );
    }

    // Handle image features
    const isSelected = selectedFeatures[activeTab as keyof SelectedFeatures] === feature.id;
    return (
      <TouchableOpacity
        key={feature.id}
        style={[
          styles.featureButton,
          isSelected && styles.selectedFeature
        ]}
        onPress={() => handleFeatureSelect(feature.id)}
      >
        <Image source={feature.source} style={styles.featureImage} />
      </TouchableOpacity>
    );
  };

  const renderTabContent = () => {
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuresContainer}
      >
        {features[activeTab as keyof typeof features].map(feature => renderFeatureButton(feature))}
      </ScrollView>
    );
  };

  // Helper function to get the selected feature object
  const getSelectedFeature = (category: 'body' | 'face') => {
    return features[category].find(feature => feature.id === selectedFeatures[category]);
  };

  // Get the selected feature sources for the renderer
  const getSelectedSource = (category: 'body' | 'face') => {
    const selectedFeature = features[category].find(
      feature => feature.id === selectedFeatures[category]
    );
    return selectedFeature?.source;
  };

  return (
    <View style={styles.container}>
      {/* Header with Preview */}
      <View style={styles.header}>
        <Text style={styles.title}>Create Character</Text>
        <TouchableOpacity style={styles.previewButton}>
          <Text style={styles.previewButtonText}>Preview</Text>
        </TouchableOpacity>
      </View>

      {/* Avatar Preview Area */}
      <View style={styles.avatarPreview}>
        {/* Replace the old avatar container with CharacterRenderer */}
        <CharacterRenderer
          selectedColor={selectedFeatures.color}
          bodySource={getSelectedSource('body')}
          faceSource={getSelectedSource('face')}
          size={200}
        />
        
        {/* Randomize Button */}
        <TouchableOpacity 
          style={styles.randomizeButton}
          onPress={randomizeAvatar}
        >
          <Text style={styles.randomizeButtonText}>🎲 Randomize</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['body', 'face', 'color'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Feature Selection */}
      <View style={styles.contentContainer}>
        {renderTabContent()}
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Character</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  previewButton: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  previewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  avatarPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  randomizeButton: {
    position: 'absolute',
    bottom: 50,
    left: 30,
    backgroundColor: '#E74C3C',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  randomizeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#3498DB',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7F8C8D',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  contentContainer: {
    flex: 0.4,
    paddingVertical: 20,
  },
  featuresContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  featureButton: {
    marginHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedFeature: {
    borderWidth: 3,
    borderColor: '#3498DB',
  },
  featureImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  colorButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomActions: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#27AE60',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CharCreateScreen;