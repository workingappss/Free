import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { 
  Check, 
  Plus, 
  Minus, 
  Clock, 
  Flame,
  X
} from 'lucide-react-native';
import { Habit, HabitEntry } from '@/types/habit';
import { useTheme } from '@/contexts/ThemeContext';

interface HabitCardProps {
  habit: Habit;
  entry?: HabitEntry;
  onToggle: (completed: boolean, value?: number) => void;
  onPress: () => void;
  streak?: number;
}

export default function HabitCard({ 
  habit, 
  entry, 
  onToggle, 
  onPress,
  streak = 0 
}: HabitCardProps) {
  const [showValueInput, setShowValueInput] = useState(false);
  const [inputValue, setInputValue] = useState(entry?.value?.toString() || '');
  const { colors } = useTheme();

  const isCompleted = entry?.completed || false;
  const currentValue = entry?.value || 0;

  const handleBooleanToggle = () => {
    onToggle(!isCompleted);
  };

  const handleMeasurableToggle = () => {
    if (habit.type === 'measurable') {
      setShowValueInput(true);
    } else {
      handleBooleanToggle();
    }
  };

  const handleValueSubmit = () => {
    const value = parseFloat(inputValue);
    if (isNaN(value) || value < 0) {
      Alert.alert('Invalid Value', 'Please enter a valid positive number');
      return;
    }

    const targetReached = habit.targetValue ? value >= habit.targetValue : value > 0;
    onToggle(targetReached, value);
    setShowValueInput(false);
    setInputValue('');
  };

  const handleQuickAdjust = (adjustment: number) => {
    const newValue = Math.max(0, currentValue + adjustment);
    const targetReached = habit.targetValue ? newValue >= habit.targetValue : newValue > 0;
    onToggle(targetReached, newValue);
  };

  const getProgressPercentage = () => {
    if (habit.type === 'measurable' && habit.targetValue && currentValue > 0) {
      return Math.min((currentValue / habit.targetValue) * 100, 100);
    }
    return isCompleted ? 100 : 0;
  };

  const progressPercentage = getProgressPercentage();

  return (
    <>
      <TouchableOpacity 
        style={[
          styles.container,
          { backgroundColor: colors.surface, borderColor: colors.borderLight },
          { borderLeftColor: habit.color },
          isCompleted && { backgroundColor: colors.card }
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={[styles.iconContainer, { backgroundColor: habit.color + '20' }]}>
              <Text style={[styles.iconText, { color: habit.color }]}>
                {habit.icon}
              </Text>
            </View>
            <View style={styles.titleInfo}>
              <Text style={[styles.title, { color: colors.text }, isCompleted && { color: colors.textSecondary }]}>
                {habit.name}
              </Text>
              <View style={styles.metaInfo}>
                {streak > 0 && (
                  <View style={styles.metaItem}>
                    <Flame size={12} color={colors.warning} strokeWidth={2} />
                    <Text style={[styles.metaText, { color: colors.warning }]}>
                      {streak} day{streak !== 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.checkButton,
              { backgroundColor: habit.color + '20' },
              isCompleted && { backgroundColor: habit.color }
            ]}
            onPress={handleMeasurableToggle}
            activeOpacity={0.7}
          >
            {isCompleted ? (
              <Check size={18} color="#FFFFFF" strokeWidth={2.5} />
            ) : (
              <Plus size={18} color={habit.color} strokeWidth={2.5} />
            )}
          </TouchableOpacity>
        </View>

        {/* Progress Section */}
        {habit.type === 'measurable' && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                {currentValue} {habit.unit}
                {habit.targetValue && ` / ${habit.targetValue} ${habit.unit}`}
              </Text>
              {habit.targetValue && (
                <Text style={[styles.progressPercentage, { color: habit.color }]}>
                  {Math.round(progressPercentage)}%
                </Text>
              )}
            </View>
            
            {habit.targetValue && (
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${progressPercentage}%`,
                      backgroundColor: habit.color 
                    }
                  ]} 
                />
              </View>
            )}

            {/* Quick Adjust Buttons */}
            {currentValue > 0 && (
              <View style={styles.quickAdjustContainer}>
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => handleQuickAdjust(-1)}
                  activeOpacity={0.7}
                >
                  <Minus size={14} color="#6B7280" strokeWidth={2} />
                </TouchableOpacity>
                
                <Text style={styles.currentValue}>
                  {currentValue} {habit.unit}
                </Text>
                
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => handleQuickAdjust(1)}
                  activeOpacity={0.7}
                >
                  <Plus size={14} color="#6B7280" strokeWidth={2} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Motivational Question */}
        {habit.motivationalQuestion && (
          <View style={styles.motivationContainer}>
            <Text style={styles.motivationText}>
              "{habit.motivationalQuestion}"
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Value Input Modal */}
      <Modal
        visible={showValueInput}
        transparent
        animationType="slide"
        onRequestClose={() => setShowValueInput(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.valueInputContainer}>
            <View style={styles.valueInputHeader}>
              <Text style={styles.valueInputTitle}>Log {habit.name}</Text>
              <TouchableOpacity
                onPress={() => setShowValueInput(false)}
                activeOpacity={0.7}
              >
                <X size={20} color="#6B7280" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <View style={styles.valueInputContent}>
              <Text style={styles.valueInputLabel}>
                How many {habit.unit}?
              </Text>
              <TextInput
                style={styles.valueInput}
                value={inputValue}
                onChangeText={setInputValue}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                autoFocus
              />
              {habit.targetValue && (
                <Text style={styles.targetText}>
                  Target: {habit.targetValue} {habit.unit}
                </Text>
              )}
            </View>

            <View style={styles.valueInputActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowValueInput(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: habit.color }]}
                onPress={handleValueSubmit}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>Log Progress</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  completedContainer: {
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
  },
  titleInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  completedTitle: {
    color: '#6B7280',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
  checkButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSection: {
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  progressPercentage: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  quickAdjustContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  adjustButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    minWidth: 80,
    textAlign: 'center',
  },
  motivationContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#E5E7EB',
  },
  motivationText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  valueInputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  valueInputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  valueInputTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  valueInputContent: {
    padding: 20,
  },
  valueInputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 12,
  },
  valueInput: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  targetText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  valueInputActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});