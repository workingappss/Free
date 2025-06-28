import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Target, X } from 'lucide-react-native';
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Create Simple Task</Text>
        <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.card }]} onPress={handleCancel} activeOpacity={0.7}>
          <X size={20} color={colors.textSecondary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
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
              style={[styles.cancelButton, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
  },
  input: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
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
    marginBottom: 12,
    gap: 4,
  },
  goalButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  saveButton: {
    flex: 1,
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