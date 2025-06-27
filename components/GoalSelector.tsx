import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Target, ChevronDown, X, Check, Plus } from 'lucide-react-native';
import { Goal } from '@/types/goal';
import { taskStorage } from '@/utils/taskStorage';
import { useTheme } from '@/contexts/ThemeContext';

interface GoalSelectorProps {
  selectedGoalId?: string;
  goalContribution?: number;
  goalUnit?: string;
  onGoalSelect: (goalId: string | undefined, contribution: number | undefined, unit: string | undefined) => void;
}

export default function GoalSelector({ 
  selectedGoalId, 
  goalContribution, 
  goalUnit, 
  onGoalSelect 
}: GoalSelectorProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [contributionInput, setContributionInput] = useState(goalContribution?.toString() || '');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const { colors } = useTheme();

  useEffect(() => {
    loadGoals();
  }, []);

  useEffect(() => {
    if (selectedGoalId) {
      const goal = goals.find(g => g.id === selectedGoalId);
      setSelectedGoal(goal || null);
    } else {
      setSelectedGoal(null);
    }
  }, [selectedGoalId, goals]);

  const loadGoals = async () => {
    try {
      const allGoals = await taskStorage.getGoals();
      // Only show quantifiable goals that are not completed
      const availableGoals = allGoals.filter(goal => 
        goal.type === 'quantifiable' && !goal.isCompleted
      );
      setGoals(availableGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const handleGoalSelect = (goal: Goal) => {
    setSelectedGoal(goal);
    setContributionInput('');
  };

  const handleSave = () => {
    if (!selectedGoal) {
      onGoalSelect(undefined, undefined, undefined);
      setShowModal(false);
      return;
    }

    const contribution = parseFloat(contributionInput);
    if (!contributionInput || isNaN(contribution) || contribution <= 0) {
      Alert.alert('Invalid Contribution', 'Please enter a valid positive number for the contribution amount.');
      return;
    }

    onGoalSelect(selectedGoal.id, contribution, selectedGoal.unit);
    setShowModal(false);
  };

  const handleRemoveGoal = () => {
    setSelectedGoal(null);
    setContributionInput('');
    onGoalSelect(undefined, undefined, undefined);
    setShowModal(false);
  };

  const getDisplayText = () => {
    if (!selectedGoal) {
      return 'Link to goal (optional)';
    }
    
    const contribution = goalContribution || 0;
    const unit = goalUnit || selectedGoal.unit || '';
    return `${selectedGoal.title} (+${contribution} ${unit})`;
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.selector,
          { backgroundColor: colors.card, borderColor: colors.borderLight },
          selectedGoal && { borderColor: colors.primary }
        ]}
        onPress={() => setShowModal(true)}
        activeOpacity={0.7}
      >
        <View style={styles.selectorContent}>
          <Target 
            size={16} 
            color={selectedGoal ? colors.primary : colors.textSecondary} 
            strokeWidth={2} 
          />
          <Text style={[
            styles.selectorText,
            { color: selectedGoal ? colors.text : colors.textSecondary }
          ]}>
            {getDisplayText()}
          </Text>
        </View>
        <ChevronDown size={16} color={colors.textTertiary} strokeWidth={2} />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.borderLight }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Link to Goal</Text>
            <TouchableOpacity onPress={() => setShowModal(false)} activeOpacity={0.7}>
              <X size={20} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {goals.length === 0 ? (
              <View style={styles.emptyState}>
                <Target size={32} color={colors.textTertiary} strokeWidth={1.5} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Available Goals</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Create quantifiable goals to link tasks to them
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Goals</Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                    Select a goal to contribute progress when this task is completed
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.goalOption,
                    { backgroundColor: colors.background, borderColor: colors.borderLight },
                    !selectedGoal && { borderColor: colors.primary, backgroundColor: colors.primaryLight }
                  ]}
                  onPress={() => setSelectedGoal(null)}
                  activeOpacity={0.7}
                >
                  <View style={styles.goalInfo}>
                    <Text style={[styles.goalTitle, { color: colors.textSecondary }]}>
                      No goal linked
                    </Text>
                    <Text style={[styles.goalDescription, { color: colors.textTertiary }]}>
                      Complete this task without contributing to any goal
                    </Text>
                  </View>
                  {!selectedGoal && (
                    <Check size={16} color={colors.primary} strokeWidth={2} />
                  )}
                </TouchableOpacity>

                {goals.map((goal) => {
                  const isSelected = selectedGoal?.id === goal.id;
                  const progress = goal.currentProgress || 0;
                  const target = goal.targetNumber || 0;
                  const progressPercentage = target > 0 ? (progress / target) * 100 : 0;

                  return (
                    <TouchableOpacity
                      key={goal.id}
                      style={[
                        styles.goalOption,
                        { backgroundColor: colors.background, borderColor: colors.borderLight },
                        isSelected && { borderColor: colors.primary, backgroundColor: colors.primaryLight }
                      ]}
                      onPress={() => handleGoalSelect(goal)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.goalInfo}>
                        <View style={styles.goalHeader}>
                          <Text style={[styles.goalTitle, { color: colors.text }]}>
                            {goal.title}
                          </Text>
                          <View style={[styles.goalBadge, { backgroundColor: goal.color + '20' }]}>
                            <Text style={[styles.goalBadgeText, { color: goal.color }]}>
                              {goal.category}
                            </Text>
                          </View>
                        </View>
                        
                        <Text style={[styles.goalDescription, { color: colors.textSecondary }]}>
                          {goal.description}
                        </Text>
                        
                        <View style={styles.goalProgress}>
                          <Text style={[styles.goalProgressText, { color: colors.textSecondary }]}>
                            {progress} / {target} {goal.unit} ({Math.round(progressPercentage)}%)
                          </Text>
                          <View style={[styles.goalProgressBar, { backgroundColor: colors.borderLight }]}>
                            <View 
                              style={[
                                styles.goalProgressFill, 
                                { 
                                  width: `${Math.min(progressPercentage, 100)}%`,
                                  backgroundColor: goal.color 
                                }
                              ]} 
                            />
                          </View>
                        </View>
                      </View>
                      
                      {isSelected && (
                        <Check size={16} color={colors.primary} strokeWidth={2} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            {selectedGoal && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Contribution Amount</Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                  How much will this task contribute to "{selectedGoal.title}"?
                </Text>
                
                <View style={styles.contributionContainer}>
                  <TextInput
                    style={[styles.contributionInput, { color: colors.text, borderColor: colors.borderLight }]}
                    placeholder="Enter amount"
                    placeholderTextColor={colors.textTertiary}
                    value={contributionInput}
                    onChangeText={setContributionInput}
                    keyboardType="numeric"
                    autoFocus
                  />
                  <Text style={[styles.contributionUnit, { color: colors.textSecondary }]}>
                    {selectedGoal.unit}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={[styles.modalActions, { borderTopColor: colors.borderLight }]}>
            {selectedGoalId && (
              <TouchableOpacity
                style={[styles.removeButton, { backgroundColor: colors.card }]}
                onPress={handleRemoveGoal}
                activeOpacity={0.7}
              >
                <Text style={[styles.removeButtonText, { color: colors.error }]}>Remove Link</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>
                {selectedGoal ? 'Link Goal' : 'No Link'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 8,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  selectorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  goalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  goalInfo: {
    flex: 1,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  goalTitle: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  goalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  goalBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  goalDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 8,
  },
  goalProgress: {
    gap: 4,
  },
  goalProgressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  goalProgressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  contributionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contributionInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  contributionUnit: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  removeButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});