import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Target } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import GoalSelector from './GoalSelector';

interface SimpleTaskInputProps {
  onSave: (title: string, goalData?: { goalId: string; contribution: number; unit: string }) => void;
  onCancel: () => void;
  placeholder?: string;
}

export default function SimpleTaskInput({ 
  onSave, 
  onCancel, 
  placeholder = "What needs to be done?" 
}: SimpleTaskInputProps) {
  const [taskTitle, setTaskTitle] = useState('');
  const [showGoalSelector, setShowGoalSelector] = useState(false);
  const [linkedGoalId, setLinkedGoalId] = useState<string | undefined>();
  const [goalContribution, setGoalContribution] = useState<number | undefined>();
  const [goalUnit, setGoalUnit] = useState<string | undefined>();
  const { colors } = useTheme();

  const handleSave = () => {
    if (!taskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    const goalData = linkedGoalId && goalContribution && goalUnit 
      ? { goalId: linkedGoalId, contribution: goalContribution, unit: goalUnit }
      : undefined;
    
    onSave(taskTitle.trim(), goalData);
    setTaskTitle(''); // Clear input after saving
    setLinkedGoalId(undefined);
    setGoalContribution(undefined);
    setGoalUnit(undefined);
  };

  const handleCancel = () => {
    setTaskTitle(''); // Clear input when canceling
    setLinkedGoalId(undefined);
    setGoalContribution(undefined);
    setGoalUnit(undefined);
    onCancel();
  };

  const handleGoalSelect = (goalId: string | undefined, contribution: number | undefined, unit: string | undefined) => {
    setLinkedGoalId(goalId);
    setGoalContribution(contribution);
    setGoalUnit(unit);
    setShowGoalSelector(false);
  };

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          value={taskTitle}
          onChangeText={setTaskTitle}
          autoFocus
          onSubmitEditing={handleSave}
          returnKeyType="done"
          multiline
        />
        
        {/* Goal Link Button */}
        <TouchableOpacity
          style={[styles.goalButton, { borderColor: colors.borderLight }]}
          onPress={() => setShowGoalSelector(true)}
          activeOpacity={0.7}
        >
          <Target size={14} color={linkedGoalId ? colors.primary : colors.textTertiary} strokeWidth={2} />
          <Text style={[
            styles.goalButtonText, 
            { color: linkedGoalId ? colors.primary : colors.textTertiary }
          ]}>
            {linkedGoalId ? `+${goalContribution} ${goalUnit}` : 'Link goal'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: colors.card }]}
            onPress={handleCancel}
            activeOpacity={0.7}
          >
            <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Add task</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Goal Selector Modal */}
      <Modal
        visible={showGoalSelector}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowGoalSelector(false)}
      >
        <GoalSelector
          selectedGoalId={linkedGoalId}
          goalContribution={goalContribution}
          goalUnit={goalUnit}
          onGoalSelect={handleGoalSelect}
        />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginBottom: 16,
    paddingVertical: 4,
    minHeight: 20,
  },
  goalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    gap: 4,
  },
  goalButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});