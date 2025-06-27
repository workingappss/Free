import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import { Target, Plus, ChevronRight, Calendar, Check, Trash2, CreditCard as Edit3, Clock, TrendingUp, Users, Percent, ChartBar as BarChart3 } from 'lucide-react-native';
import GoalForm from '@/components/GoalForm';
import { taskStorage } from '@/utils/taskStorage';
import { Goal, GoalContribution } from '@/types/goal';
import { useTheme } from '@/contexts/ThemeContext';

type ModalState = 'none' | 'create' | 'edit' | 'updateProgress' | 'updateEstimation';

const TIMEFRAME_COLORS = {
  weekly: '#EF4444',
  monthly: '#F59E0B',
  quarterly: '#8B5CF6',
  yearly: '#06B6D4',
  custom: '#6B7280',
};

const TIMEFRAME_LABELS = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
  custom: 'Custom',
};

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalContributions, setGoalContributions] = useState<Record<string, GoalContribution[]>>({});
  const [modalState, setModalState] = useState<ModalState>('none');
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [progressUpdateGoal, setProgressUpdateGoal] = useState<Goal | null>(null);
  const [newProgressValue, setNewProgressValue] = useState('');
  const { colors } = useTheme();

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allGoals, allContributions] = await Promise.all([
        taskStorage.getGoals(),
        taskStorage.getGoalContributions()
      ]);
      
      setGoals(allGoals);
      
      // Group contributions by goal ID
      const contributionsByGoal = allContributions.reduce((acc, contribution) => {
        if (!acc[contribution.goalId]) {
          acc[contribution.goalId] = [];
        }
        acc[contribution.goalId].push(contribution);
        return acc;
      }, {} as Record<string, GoalContribution[]>);
      
      setGoalContributions(contributionsByGoal);
    } catch (error) {
      console.error('Error loading goals data:', error);
    }
  };

  const openCreateModal = () => {
    setEditingGoal(null);
    setModalState('create');
  };

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setModalState('edit');
  };

  const openProgressUpdateModal = (goal: Goal) => {
    setProgressUpdateGoal(goal);
    if (goal.type === 'quantifiable') {
      setNewProgressValue(goal.currentProgress?.toString() || '0');
      setModalState('updateProgress');
    } else {
      setNewProgressValue(goal.estimatedProgress?.toString() || '0');
      setModalState('updateEstimation');
    }
  };

  const closeModal = () => {
    setModalState('none');
    setEditingGoal(null);
    setProgressUpdateGoal(null);
    setNewProgressValue('');
  };

  const handleSaveGoal = (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    if (editingGoal) {
      // Update existing goal
      const updatedGoal = { ...goalData, id: editingGoal.id, createdAt: editingGoal.createdAt };
      taskStorage.saveGoal(updatedGoal);
      setGoals(prev => prev.map(goal => 
        goal.id === editingGoal.id ? updatedGoal : goal
      ));
    } else {
      // Create new goal
      const newGoal: Goal = {
        ...goalData,
        id: Date.now().toString(),
        createdAt: new Date(),
      };
      taskStorage.saveGoal(newGoal);
      setGoals(prev => [...prev, newGoal]);
    }
    closeModal();
  };

  const handleDeleteGoal = (goalId: string) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Note: In a real app, you'd want to implement deleteGoal in taskStorage
              setGoals(prev => prev.filter(goal => goal.id !== goalId));
            } catch (error) {
              console.error('Error deleting goal:', error);
              Alert.alert('Error', 'Failed to delete goal');
            }
          }
        },
      ]
    );
  };

  const handleProgressUpdate = () => {
    if (!progressUpdateGoal) return;

    const newProgress = parseInt(newProgressValue, 10);
    if (isNaN(newProgress) || newProgress < 0) {
      Alert.alert('Error', 'Please enter a valid progress number');
      return;
    }

    if (modalState === 'updateProgress') {
      // Quantifiable goal progress update
      if (progressUpdateGoal.targetNumber && newProgress > progressUpdateGoal.targetNumber) {
        Alert.alert('Error', `Progress cannot exceed target of ${progressUpdateGoal.targetNumber}`);
        return;
      }

      setGoals(prev => prev.map(goal => {
        if (goal.id === progressUpdateGoal.id && goal.type === 'quantifiable' && goal.targetNumber) {
          return {
            ...goal,
            currentProgress: newProgress,
            isCompleted: newProgress >= goal.targetNumber
          };
        }
        return goal;
      }));
      
      // Save updated goal
      const updatedGoal = goals.find(g => g.id === progressUpdateGoal.id);
      if (updatedGoal) {
        const goalToSave = {
          ...updatedGoal,
          currentProgress: newProgress,
          isCompleted: progressUpdateGoal.targetNumber ? newProgress >= progressUpdateGoal.targetNumber : false
        };
        taskStorage.saveGoal(goalToSave);
      }
    } else if (modalState === 'updateEstimation') {
      // Non-quantifiable goal estimation update
      if (newProgress > 100) {
        Alert.alert('Error', 'Progress percentage cannot exceed 100%');
        return;
      }

      setGoals(prev => prev.map(goal => {
        if (goal.id === progressUpdateGoal.id && goal.type === 'non-quantifiable') {
          return {
            ...goal,
            estimatedProgress: newProgress,
            isCompleted: newProgress >= 100
          };
        }
        return goal;
      }));
      
      // Save updated goal
      const updatedGoal = goals.find(g => g.id === progressUpdateGoal.id);
      if (updatedGoal) {
        const goalToSave = {
          ...updatedGoal,
          estimatedProgress: newProgress,
          isCompleted: newProgress >= 100
        };
        taskStorage.saveGoal(goalToSave);
      }
    }

    closeModal();
  };

  // Group goals by timeframe
  const groupedGoals = goals.reduce((acc, goal) => {
    if (!acc[goal.timeframe]) {
      acc[goal.timeframe] = [];
    }
    acc[goal.timeframe].push(goal);
    return acc;
  }, {} as Record<string, Goal[]>);

  // Sort timeframes by priority
  const timeframeOrder = ['weekly', 'monthly', 'quarterly', 'yearly', 'custom'];
  const sortedTimeframes = timeframeOrder.filter(timeframe => groupedGoals[timeframe]?.length > 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Goals</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Track your progress</Text>
            </View>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]} 
              onPress={openCreateModal}
              activeOpacity={0.8}
            >
              <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Target size={32} color="#9CA3AF" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>No goals yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first goal to start tracking your progress
            </Text>
            <TouchableOpacity 
              style={styles.emptyActionButton}
              onPress={openCreateModal}
              activeOpacity={0.8}
            >
              <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.emptyActionButtonText}>Create Goal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Goals grouped by timeframe */}
            {sortedTimeframes.map((timeframe) => {
              const timeframeGoals = groupedGoals[timeframe];
              const activeGoals = timeframeGoals.filter(goal => !goal.isCompleted);
              const completedGoals = timeframeGoals.filter(goal => goal.isCompleted);
              
              return (
                <View key={timeframe} style={styles.timeframeSection}>
                  <View style={styles.timeframeSectionHeader}>
                    <View style={styles.timeframeTitleContainer}>
                      <View style={[
                        styles.timeframeIndicator, 
                        { backgroundColor: TIMEFRAME_COLORS[timeframe as keyof typeof TIMEFRAME_COLORS] }
                      ]} />
                      <Text style={styles.timeframeSectionTitle}>
                        {TIMEFRAME_LABELS[timeframe as keyof typeof TIMEFRAME_LABELS]} Goals
                      </Text>
                    </View>
                    <View style={styles.timeframeBadge}>
                      <Text style={styles.timeframeBadgeText}>
                        {activeGoals.length} active
                      </Text>
                    </View>
                  </View>

                  {/* Active Goals */}
                  {activeGoals.map((goal) => (
                    <GoalCard 
                      key={goal.id} 
                      goal={goal} 
                      onEdit={() => openEditModal(goal)}
                      onDelete={() => handleDeleteGoal(goal.id)}
                      onUpdateProgress={() => openProgressUpdateModal(goal)}
                    />
                  ))}

                  {/* Completed Goals */}
                  {completedGoals.length > 0 && (
                    <>
                      <View style={styles.completedSectionHeader}>
                        <Text style={styles.completedSectionTitle}>
                          Completed ({completedGoals.length})
                        </Text>
                      </View>
                      {completedGoals.map((goal) => (
                        <GoalCard 
                          key={goal.id} 
                          goal={goal} 
                          onEdit={() => openEditModal(goal)}
                          onDelete={() => handleDeleteGoal(goal.id)}
                          onUpdateProgress={() => openProgressUpdateModal(goal)}
                        />
                      ))}
                    </>
                  )}
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* Goal Form Modal */}
      <Modal
        visible={modalState === 'create' || modalState === 'edit'}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeModal}
      >
        <GoalForm
          goal={editingGoal}
          onSave={handleSaveGoal}
          onCancel={closeModal}
          isEditing={modalState === 'edit'}
        />
      </Modal>

      {/* Progress Update Modal */}
      <Modal
        visible={modalState === 'updateProgress' || modalState === 'updateEstimation'}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.progressUpdateContainer}>
            <View style={styles.progressUpdateHeader}>
              <Text style={styles.progressUpdateTitle}>
                {modalState === 'updateProgress' ? 'Update Progress' : 'Update Estimation'}
              </Text>
              <Text style={styles.progressUpdateSubtitle}>
                {progressUpdateGoal?.title}
              </Text>
            </View>

            <View style={styles.progressUpdateContent}>
              <Text style={styles.progressUpdateLabel}>
                {modalState === 'updateProgress' 
                  ? `Current Progress (${progressUpdateGoal?.unit || 'units'})`
                  : 'Estimated Progress (%)'
                }
              </Text>
              <TextInput
                style={styles.progressUpdateInput}
                value={newProgressValue}
                onChangeText={setNewProgressValue}
                keyboardType="numeric"
                placeholder={modalState === 'updateProgress' ? 'Enter progress' : 'Enter percentage (0-100)'}
                placeholderTextColor="#9CA3AF"
                autoFocus
              />
              
              {modalState === 'updateProgress' && progressUpdateGoal?.targetNumber && (
                <Text style={styles.progressUpdateTarget}>
                  Target: {progressUpdateGoal.targetNumber} {progressUpdateGoal.unit}
                </Text>
              )}
              
              {modalState === 'updateEstimation' && (
                <Text style={styles.progressUpdateTarget}>
                  How much of this goal do you estimate is complete?
                </Text>
              )}
            </View>

            <View style={styles.progressUpdateActions}>
              <TouchableOpacity
                style={styles.progressUpdateCancelButton}
                onPress={closeModal}
                activeOpacity={0.7}
              >
                <Text style={styles.progressUpdateCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.progressUpdateSaveButton}
                onPress={handleProgressUpdate}
                activeOpacity={0.8}
              >
                <Text style={styles.progressUpdateSaveText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function GoalCard({ 
  goal, 
  onEdit, 
  onDelete, 
  onUpdateProgress 
}: { 
  goal: Goal; 
  onEdit: () => void;
  onDelete: () => void;
  onUpdateProgress: () => void;
}) {
  const [contributions, setContributions] = React.useState<GoalContribution[]>([]);

  React.useEffect(() => {
    loadContributions();
  }, [goal.id]);

  const loadContributions = async () => {
    try {
      const goalContributions = await taskStorage.getGoalContributionsForGoal(goal.id);
      setContributions(goalContributions);
    } catch (error) {
      console.error('Error loading goal contributions:', error);
    }
  };

  const getProgressData = () => {
    if (goal.type === 'quantifiable' && goal.targetNumber && goal.currentProgress !== undefined) {
      const percentage = (goal.currentProgress / goal.targetNumber) * 100;
      return {
        current: goal.currentProgress,
        target: goal.targetNumber,
        percentage: Math.round(percentage),
        unit: goal.unit || '',
        showProgressBar: true
      };
    } else {
      // For non-quantifiable goals, show contributed hours and tasks
      return {
        contributedHours: goal.contributedHours || 0,
        contributedTasks: goal.contributedTasks || 0,
        estimatedProgress: goal.estimatedProgress || 0,
        showProgressBar: false
      };
    }
  };

  const progressData = getProgressData();

  const formatDeadline = (deadline: Date) => {
    return deadline.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntilDeadline = (deadline: Date) => {
    // Get current date at start of day (midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get deadline date at start of day (midnight)
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    
    // Calculate difference in milliseconds
    const diffTime = deadlineDate.getTime() - today.getTime();
    
    // Convert to days and round
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getDaysLeftDisplay = (deadline: Date) => {
    const daysLeft = getDaysUntilDeadline(deadline);
    
    if (daysLeft < 0) {
      const overdueDays = Math.abs(daysLeft);
      return {
        text: `${overdueDays} day${overdueDays === 1 ? '' : 's'} overdue`,
        color: '#DC2626', // Red for overdue
        bgColor: '#FEE2E2',
        urgent: true
      };
    } else if (daysLeft === 0) {
      return {
        text: 'Due today',
        color: '#D97706', // Orange for today
        bgColor: '#FEF3C7',
        urgent: true
      };
    } else if (daysLeft === 1) {
      return {
        text: '1 day left',
        color: '#D97706', // Orange for tomorrow
        bgColor: '#FEF3C7',
        urgent: true
      };
    } else if (daysLeft <= 7) {
      return {
        text: `${daysLeft} days left`,
        color: '#CA8A04', // Yellow for this week
        bgColor: '#FEF3C7',
        urgent: false
      };
    } else {
      return {
        text: `${daysLeft} days left`,
        color: '#6B7280', // Gray for future
        bgColor: '#F3F4F6',
        urgent: false
      };
    }
  };

  const timeframeColor = TIMEFRAME_COLORS[goal.timeframe as keyof typeof TIMEFRAME_COLORS];

  return (
    <View style={styles.goalCard}>
      <View style={styles.goalHeader}>
        <View style={[styles.goalColorIndicator, { backgroundColor: goal.color }]} />
        <View style={styles.goalInfo}>
          <View style={styles.goalTitleContainer}>
            <Text style={[styles.goalTitle, goal.isCompleted && styles.completedText]}>
              {goal.title}
            </Text>
            <View style={[styles.goalTypeBadge, { backgroundColor: timeframeColor + '20' }]}>
              <Text style={[styles.goalTypeBadgeText, { color: timeframeColor }]}>
                {TIMEFRAME_LABELS[goal.timeframe as keyof typeof TIMEFRAME_LABELS]}
              </Text>
            </View>
          </View>
          {goal.description && (
            <Text style={styles.goalDescription}>{goal.description}</Text>
          )}
        </View>
        <View style={styles.goalActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onEdit}
            activeOpacity={0.7}
          >
            <Edit3 size={16} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onDelete}
            activeOpacity={0.7}
          >
            <Trash2 size={16} color="#EF4444" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Section */}
      <View style={styles.goalProgress}>
        {progressData.showProgressBar ? (
          // Quantifiable Goal Progress
          <>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                {progressData.current} of {progressData.target} {progressData.unit}
              </Text>
              <Text style={styles.progressPercentage}>
                {progressData.percentage}%
              </Text>
            </View>
            
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min(progressData.percentage, 100)}%`,
                    backgroundColor: goal.color 
                  }
                ]} 
              />
            </View>

            {/* Update Progress Button */}
            {!goal.isCompleted && (
              <TouchableOpacity
                style={styles.updateProgressButton}
                onPress={onUpdateProgress}
                activeOpacity={0.7}
              >
                <TrendingUp size={14} color="#4F46E5" strokeWidth={2} />
                <Text style={styles.updateProgressButtonText}>Update Progress</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          // Non-Quantifiable Goal Contributions and Estimation
          <>
            {/* Compact Contributions Row */}
            <View style={styles.contributionsRow}>
              <View style={styles.contributionCompactItem}>
                <Clock size={12} color="#F59E0B" strokeWidth={2} />
                <Text style={styles.contributionCompactValue}>
                  {progressData.contributedHours}h
                </Text>
              </View>

              <View style={styles.contributionCompactDivider} />

              <View style={styles.contributionCompactItem}>
                <Check size={12} color="#10B981" strokeWidth={2} />
                <Text style={styles.contributionCompactValue}>
                  {progressData.contributedTasks} tasks
                </Text>
              </View>
            </View>

            {/* Progress Estimation */}
            <View style={styles.estimationContainer}>
              <View style={styles.estimationHeader}>
                <Text style={styles.estimationLabel}>Estimated Progress</Text>
                <Text style={styles.estimationPercentage}>
                  {progressData.estimatedProgress}%
                </Text>
              </View>
              
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${Math.min(progressData.estimatedProgress, 100)}%`,
                      backgroundColor: goal.color 
                    }
                  ]} 
                />
              </View>

              {/* Update Estimation Button */}
              {!goal.isCompleted && (
                <TouchableOpacity
                  style={styles.updateEstimationButton}
                  onPress={onUpdateProgress}
                  activeOpacity={0.7}
                >
                  <Percent size={14} color="#4F46E5" strokeWidth={2} />
                  <Text style={styles.updateEstimationButtonText}>Update Estimation</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>

      <View style={styles.goalFooter}>
        <View style={[styles.categoryBadge, { backgroundColor: goal.color + '20' }]}>
          <Text style={[styles.categoryText, { color: goal.color }]}>
            {goal.category}
          </Text>
        </View>
        
        {goal.deadline && (
          <View style={styles.dueDateContainer}>
            <Calendar size={12} color="#9CA3AF" strokeWidth={2} />
            <Text style={styles.dueDate}>{formatDeadline(goal.deadline)}</Text>
            {!goal.isCompleted && (() => {
              const daysLeftInfo = getDaysLeftDisplay(goal.deadline);
              return (
                <View style={[
                  styles.daysLeftContainer,
                  { backgroundColor: daysLeftInfo.bgColor }
                ]}>
                  <Clock size={10} color={daysLeftInfo.color} strokeWidth={2} />
                  <Text style={[
                    styles.daysLeftText,
                    { color: daysLeftInfo.color }
                  ]}>
                    {daysLeftInfo.text}
                  </Text>
                </View>
              );
            })()}
          </View>
        )}

        {/* Recent Contributions */}
        {contributions.length > 0 && (
          <View style={styles.contributionsSection}>
            <View style={styles.contributionsHeader}>
              <BarChart3 size={14} color="#6B7280" strokeWidth={2} />
              <Text style={styles.contributionsTitle}>
                Recent Contributions ({contributions.length})
              </Text>
            </View>
            <View style={styles.contributionsList}>
              {contributions.slice(0, 3).map((contribution) => (
                <View key={contribution.id} style={styles.contributionItem}>
                  <Text style={styles.contributionTask} numberOfLines={1}>
                    {contribution.taskTitle}
                  </Text>
                  <Text style={styles.contributionAmount}>
                    +{contribution.amount} {contribution.unit}
                  </Text>
                </View>
              ))}
              {contributions.length > 3 && (
                <Text style={styles.moreContributions}>
                  +{contributions.length - 3} more
                </Text>
              )}
            </View>
          </View>
        )}

        {goal.isCompleted && (
          <View style={styles.completedBadge}>
            <Check size={12} color="#10B981" strokeWidth={2} />
            <Text style={styles.completedBadgeText}>Completed</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContent: {
    padding: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyActionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  timeframeSection: {
    marginBottom: 32,
  },
  timeframeSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeframeTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeframeIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 12,
  },
  timeframeSectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  timeframeBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeframeBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  completedSectionHeader: {
    marginTop: 20,
    marginBottom: 12,
  },
  completedSectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goalColorIndicator: {
    width: 3,
    height: 32,
    borderRadius: 2,
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  goalTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  goalTypeBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  goalDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    lineHeight: 18,
  },
  goalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 6,
  },
  goalProgress: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  progressPercentage: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#4F46E5',
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
  updateProgressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  updateProgressButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#4F46E5',
    marginLeft: 4,
  },
  // Compact Contributions Styles
  contributionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contributionCompactItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contributionCompactValue: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginLeft: 4,
  },
  contributionCompactDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 8,
  },
  // Estimation Styles
  estimationContainer: {
    marginTop: 4,
  },
  estimationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  estimationLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  estimationPercentage: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#4F46E5',
  },
  updateEstimationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  updateEstimationButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#4F46E5',
    marginLeft: 4,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDate: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
  daysLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  daysLeftText: {
    fontSize: 9,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 2,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completedBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
    marginLeft: 4,
  },
  contributionsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  contributionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  contributionsTitle: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  contributionsList: {
    gap: 4,
  },
  contributionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  contributionTask: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    flex: 1,
    marginRight: 8,
  },
  contributionAmount: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
  },
  moreContributions: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
  // Progress Update Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  progressUpdateContainer: {
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
  progressUpdateHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  progressUpdateTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  progressUpdateSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  progressUpdateContent: {
    padding: 20,
  },
  progressUpdateLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  progressUpdateInput: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  progressUpdateTarget: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  progressUpdateActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  progressUpdateCancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  progressUpdateCancelText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  progressUpdateSaveButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  progressUpdateSaveText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});