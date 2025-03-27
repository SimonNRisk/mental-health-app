import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

type MoodEntry = {
  date: string;
  rating: number;
  emoji: string;
  symptoms: string[];
};

const getSymptomLabel = (symptomId: string) => {
  const allSymptoms = {
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

  for (const category of Object.values(allSymptoms)) {
    const symptom = category.find(s => s.id === symptomId);
    if (symptom) return symptom.label;
  }
  return symptomId;
};

export default function ProgressScreen() {
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [averageMood, setAverageMood] = useState(0);
  const [mostCommonSymptoms, setMostCommonSymptoms] = useState<string[]>([]);
  const [showAllEntries, setShowAllEntries] = useState(false);

  const loadMoodHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('moodHistory');
      if (history) {
        const parsedHistory = JSON.parse(history);
        console.log('Loaded history:', parsedHistory); // Debug log
        
        // Sort history by date (most recent first)
        const sortedHistory = parsedHistory.sort((a: MoodEntry, b: MoodEntry) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        setMoodHistory(sortedHistory);
        
        // Calculate average mood
        const total = sortedHistory.reduce((sum: number, entry: MoodEntry) => sum + entry.rating, 0);
        setAverageMood(sortedHistory.length > 0 ? total / sortedHistory.length : 0);

        // Calculate most common symptoms
        const symptomCounts: { [key: string]: number } = {};
        sortedHistory.forEach((entry: MoodEntry) => {
          console.log('Processing entry:', entry); // Debug log
          if (entry.symptoms && entry.symptoms.length > 0) {
            entry.symptoms.forEach((symptom: string) => {
              symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
            });
          }
        });

        const sortedSymptoms = Object.entries(symptomCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([symptom]) => symptom);

        setMostCommonSymptoms(sortedSymptoms);
      }
    } catch (error) {
      console.error('Error loading mood history:', error);
    }
  };

  // Reload data whenever the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadMoodHistory();
    }, [])
  );

  const getEmoji = (rating: number): string => {
    const emojis = ['😢', '😕', '😐', '🙂', '😊'];
    const index = Math.min(Math.floor(rating / 2), emojis.length - 1);
    return emojis[index];
  };

  const displayedHistory = showAllEntries ? moodHistory : moodHistory.slice(0, 3);

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem('moodHistory');
      setMoodHistory([]);
      setAverageMood(0);
      setMostCommonSymptoms([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Mood Progress</Text>
              <Text style={styles.subtitle}>Track your emotional journey</Text>
            </View>
          </View>

          {moodHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No mood entries yet</Text>
            </View>
          ) : (
            <>
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{moodHistory.length}</Text>
                  <Text style={styles.statLabel}>Total Entries</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{averageMood.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>Avg. Mood</Text>
                </View>
              </View>

              {mostCommonSymptoms.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Most Common Symptoms</Text>
                  <View style={styles.symptomsContainer}>
                    {mostCommonSymptoms.map((symptom) => (
                      <View key={symptom} style={styles.symptomTag}>
                        <Text style={styles.symptomText}>{getSymptomLabel(symptom)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Mood History</Text>
                {displayedHistory.map((entry, index) => (
                  <View key={index} style={styles.historyItem}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.emoji}>{entry.emoji}</Text>
                      <Text style={styles.rating}>Rating: {entry.rating}/10</Text>
                    </View>
                    <Text style={styles.date}>{entry.date}</Text>
                    {entry.symptoms && entry.symptoms.length > 0 && (
                      <View style={styles.symptomsContainer}>
                        {entry.symptoms.map((symptom) => (
                          <View key={symptom} style={styles.symptomTag}>
                            <Text style={styles.symptomText}>{getSymptomLabel(symptom)}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
                
                {moodHistory.length > 3 && (
                  <TouchableOpacity
                    style={styles.seeMoreButton}
                    onPress={() => setShowAllEntries(!showAllEntries)}
                  >
                    <Text style={styles.seeMoreText}>
                      {showAllEntries ? 'Show Less' : `See ${moodHistory.length - 3} More Entries`}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
      {moodHistory.length > 0 && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={styles.clearButtonOverlay} 
            onPress={clearHistory}
          >
            <Text style={styles.clearButtonText}>Clear History</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80, // Add padding for the clear button
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#8E8E93',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#F2F2F7',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    width: '45%',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  section: {
    backgroundColor: '#F2F2F7',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 10,
  },
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomTag: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  symptomText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  historyItem: {
    backgroundColor: '#F2F2F7',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  emoji: {
    fontSize: 32,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  date: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  seeMoreButton: {
    backgroundColor: '#F2F2F7',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  seeMoreText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#8E8E93',
    fontSize: 18,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  clearButtonOverlay: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
}); 