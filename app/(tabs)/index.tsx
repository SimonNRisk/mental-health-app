import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

type MoodEntry = {
  date: string;
  rating: number;
  emoji: string;
  symptoms: string[];
};

const sliderWidth = Dimensions.get('window').width - 40;

const getEmoji = (rating: number) => {
  if (rating === 0) return '😢';
  if (rating <= 2) return '😕';
  if (rating <= 4) return '😐';
  if (rating <= 6) return '🙂';
  if (rating <= 8) return '😊';
  return '😄';
};

const getRatingColor = (rating: number) => {
  if (rating === 0) return '#FF3B30';
  if (rating <= 2) return '#FF9500';
  if (rating <= 4) return '#FFCC00';
  if (rating <= 6) return '#34C759';
  if (rating <= 8) return '#5856D6';
  return '#FF2D55';
};

const symptoms = {
  'Emotional': [
    { id: 'anxiety', label: 'Anxiety' },
    { id: 'depression', label: 'Depression' },
    { id: 'irritability', label: 'Irritability' },
    { id: 'overwhelm', label: 'Overwhelmed' },
  ],
  'Physical': [
    { id: 'headache', label: 'Headache' },
    { id: 'fatigue', label: 'Fatigue' },
    { id: 'insomnia', label: 'Insomnia' },
    { id: 'appetite', label: 'Appetite Changes' },
  ],
  'Triggers': [
    { id: 'work', label: 'Work Stress' },
    { id: 'social', label: 'Social Pressure' },
    { id: 'health', label: 'Health Concerns' },
    { id: 'family', label: 'Family Issues' },
  ],
};

export default function TabOneScreen() {
  const [rating, setRating] = useState<number>(5);
  const [submitted, setSubmitted] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set());

  const handleSubmit = async () => {
    try {
      setSubmitted(true);
    } catch (error) {
      console.error('Error saving mood:', error);
    }
  };

  const resetRating = async () => {
    try {
      // Save the entry with symptoms when resetting
      const newEntry = {
        date: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
        timestamp: new Date().getTime(), // Add timestamp for precise sorting
        rating: Math.round(rating),
        emoji: getEmoji(rating),
        symptoms: Array.from(selectedSymptoms),
      };

      // Get existing history
      const existingHistory = await AsyncStorage.getItem('moodHistory');
      const history = existingHistory ? JSON.parse(existingHistory) : [];

      // Add new entry to the beginning of the array
      history.unshift(newEntry);

      // Save updated history
      await AsyncStorage.setItem('moodHistory', JSON.stringify(history));

      // Reset the form
      setRating(5);
      setSubmitted(false);
      setSelectedSymptoms(new Set());
    } catch (error) {
      console.error('Error saving mood:', error);
    }
  };

  const toggleSymptom = (symptomId: string) => {
    const newSelected = new Set(selectedSymptoms);
    if (newSelected.has(symptomId)) {
      newSelected.delete(symptomId);
    } else {
      newSelected.add(symptomId);
    }
    setSelectedSymptoms(newSelected);
  };

  const ratingColor = getRatingColor(rating);
  const emoji = getEmoji(rating);

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Daily Mood Check</Text>
          <Text style={styles.subtitle}>How are you feeling today?</Text>
        </View>
        
        <View style={styles.ratingContainer}>
          <Text style={[styles.emoji, { color: ratingColor }]}>{emoji}</Text>
          <Text style={[styles.ratingValue, { color: ratingColor }]}>
            {Math.round(rating)}/10
          </Text>
          
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={10}
              step={1}
              value={rating}
              onValueChange={setRating}
              minimumTrackTintColor={ratingColor}
              maximumTrackTintColor="#E5E5EA"
              thumbTintColor={ratingColor}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>Terrible</Text>
              <Text style={styles.sliderLabel}>Amazing</Text>
            </View>
          </View>
        </View>

        {!submitted && (
          <TouchableOpacity 
            style={[styles.submitButton, { backgroundColor: ratingColor }]} 
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Save My Mood</Text>
          </TouchableOpacity>
        )}

        {submitted && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>
              Your mood has been recorded as {Math.round(rating)}/10 {emoji}
            </Text>
            
            <View style={styles.symptomsContainer}>
              <Text style={styles.symptomsTitle}>How are you feeling?</Text>
              {Object.entries(symptoms).map(([category, items]) => (
                <View key={category} style={styles.categoryContainer}>
                  <Text style={styles.categoryTitle}>{category}</Text>
                  {items.map((symptom) => (
                    <TouchableOpacity
                      key={symptom.id}
                      style={styles.checkboxContainer}
                      onPress={() => toggleSymptom(symptom.id)}
                    >
                      <View style={[
                        styles.checkbox,
                        selectedSymptoms.has(symptom.id) && { backgroundColor: ratingColor }
                      ]}>
                        {selectedSymptoms.has(symptom.id) && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </View>
                      <Text style={styles.checkboxLabel}>{symptom.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.resetButton, { backgroundColor: ratingColor }]} 
              onPress={resetRating}
            >
              <Text style={styles.resetButtonText}>Track Another Mood</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#8E8E93',
  },
  ratingContainer: {
    width: sliderWidth,
    alignItems: 'center',
    marginBottom: 30,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  ratingValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sliderContainer: {
    width: sliderWidth,
    alignItems: 'center',
  },
  slider: {
    width: sliderWidth,
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: sliderWidth,
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  submitButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  resultContainer: {
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#F2F2F7',
    padding: 20,
    borderRadius: 15,
    width: sliderWidth,
  },
  resultText: {
    fontSize: 20,
    color: '#1C1C1E',
    marginBottom: 20,
    textAlign: 'center',
  },
  symptomsContainer: {
    width: '100%',
    marginTop: 20,
  },
  symptomsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 15,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  resetButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
