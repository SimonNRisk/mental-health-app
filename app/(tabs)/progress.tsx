import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

type MoodEntry = {
  date: string;
  rating: number;
  emoji: string;
};

export default function ProgressScreen() {
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);

  const loadMoodHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('moodHistory');
      if (history) {
        setMoodHistory(JSON.parse(history));
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

  const getAverageMood = () => {
    if (moodHistory.length === 0) return 0;
    const sum = moodHistory.reduce((acc, entry) => acc + entry.rating, 0);
    return (sum / moodHistory.length).toFixed(1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mood Progress</Text>
        <Text style={styles.subtitle}>Track your emotional journey</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{moodHistory.length}</Text>
          <Text style={styles.statLabel}>Total Entries</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{getAverageMood()}</Text>
          <Text style={styles.statLabel}>Average Mood</Text>
        </View>
      </View>

      <ScrollView style={styles.historyContainer}>
        {moodHistory.map((entry, index) => (
          <View key={index} style={styles.historyItem}>
            <Text style={styles.historyEmoji}>{entry.emoji}</Text>
            <View style={styles.historyDetails}>
              <Text style={styles.historyRating}>Rating: {entry.rating}/10</Text>
              <Text style={styles.historyDate}>{entry.date}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#8E8E93',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  statBox: {
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
  historyContainer: {
    flex: 1,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  historyEmoji: {
    fontSize: 32,
    marginRight: 15,
  },
  historyDetails: {
    flex: 1,
  },
  historyRating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 5,
  },
  historyDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
}); 