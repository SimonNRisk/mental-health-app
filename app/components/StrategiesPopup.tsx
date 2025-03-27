import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type StrategiesPopupProps = {
  visible: boolean;
  onClose: () => void;
  moodRating: number;
  symptoms: string[];
};

const symptomStrategies: { [key: string]: string } = {
  'anxiety': 'Practice deep breathing for 5 minutes',
  'depression': 'Take a short walk outside',
  'irritability': 'Listen to calming music',
  'overwhelm': 'Break tasks into smaller steps',
  'headache': 'Drink water and rest in a quiet space',
  'fatigue': 'Take a 20-minute power nap',
  'insomnia': 'Create a relaxing bedtime routine',
  'appetite': 'Eat small, nutritious snacks',
  'work': 'Set clear boundaries and take breaks',
  'social': 'Practice saying "no" when needed',
  'health': 'Schedule a check-up with your doctor',
  'family': 'Set aside time for self-care',
};

export default function StrategiesPopup({ visible, onClose, moodRating, symptoms }: StrategiesPopupProps) {
  console.log('StrategiesPopup received symptoms:', symptoms);
  
  const getStrategies = () => {
    if (moodRating <= 2) {
      return {
        title: 'Get Support Now',
        defaultStrategies: [
          'Book a meeting with your therapist',
          'Call a trusted friend or family member',
        ],
        icon: 'heart',
        color: '#FF3B30',
      };
    } else if (moodRating <= 4) {
      return {
        title: 'Take Care of Yourself',
        defaultStrategies: [
          'Practice mindfulness meditation',
          'Write in your journal',
        ],
        icon: 'leaf',
        color: '#FF9500',
      };
    } else if (moodRating <= 6) {
      return {
        title: 'Keep Moving Forward',
        defaultStrategies: [
          'Plan a small reward for yourself',
          'Connect with a friend',
        ],
        icon: 'star',
        color: '#FFCC00',
      };
    } else {
      return {
        title: 'Maintain Your Momentum',
        defaultStrategies: [
          'Share your positive energy with others',
          'Document what made your day great',
        ],
        icon: 'sunny',
        color: '#34C759',
      };
    }
  };

  const strategies = getStrategies();
  console.log('Base strategies:', strategies);

  const symptomSpecificStrategies = symptoms
    .map(symptom => ({
      symptom: symptom.charAt(0).toUpperCase() + symptom.slice(1),
      strategy: symptomStrategies[symptom]
    }))
    .slice(0, 2); // Limit to 2 symptom-specific strategies

  console.log('Symptom-specific strategies:', symptomSpecificStrategies);

  const allStrategies = [
    ...strategies.defaultStrategies.map(strategy => ({ type: 'default', text: strategy })),
    ...symptomSpecificStrategies.map(({ symptom, strategy }) => ({
      type: 'symptom',
      text: `${symptom}: ${strategy}`
    }))
  ];

  console.log('All strategies to display:', allStrategies);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Ionicons name={strategies.icon as any} size={32} color={strategies.color} />
            <Text style={styles.title}>{strategies.title}</Text>
          </View>
          
          <View style={styles.strategiesList}>
            {allStrategies.map((strategy, index) => (
              <View 
                key={index} 
                style={[
                  styles.strategyItem,
                  strategy.type === 'symptom' && styles.symptomStrategyItem
                ]}
              >
                <Ionicons 
                  name={strategy.type === 'symptom' ? 'medical' : 'checkmark-circle'} 
                  size={20} 
                  color={strategy.type === 'symptom' ? '#FF3B30' : strategies.color} 
                />
                <Text 
                  style={[
                    styles.strategyText,
                    strategy.type === 'symptom' && styles.symptomStrategyText
                  ]}
                >
                  {strategy.text}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity 
            style={[styles.closeButton, { backgroundColor: strategies.color }]} 
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Got it!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  strategiesList: {
    width: '100%',
    marginBottom: 20,
  },
  strategyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  strategyText: {
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
  },
  closeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  symptomStrategyItem: {
    backgroundColor: '#FFF5F5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  symptomStrategyText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
}); 