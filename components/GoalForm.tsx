import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  SafeAreaView,
  Modal,
} from 'react-native';
import { X, Calendar, Target, ChartBar as BarChart3, Palette, ChevronDown, Clock, Users, TrendingUp, BookOpen, Heart, Chrome as Home, Briefcase, Dumbbell, Coffee } from 'lucide-react-native';
import { Goal } from '@/types/goal';
import CalendarView from '@/components/CalendarView';
import { useTheme } from '@/contexts/ThemeContext';

interface GoalFormProps {
  goal?: Goal;
  onSave: (goalData: Omit<Goal, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const GOAL_COLORS = [
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6B7280', // Gray
];

const GOAL_CATEGORIES = [
  { id: 'health', label: 'Health & Fitness', icon: Dumbbell },
  { id: 'career', label: 'Career & Work', icon: Briefcase },
  { id: 'education', label: 'Education & Learning', icon: BookOpen },
  { id: 'relationships', label: 'Relationships', icon: Heart },
  { id: 'personal', label: 'Personal Development', icon: TrendingUp },
  { id: 'lifestyle', label: 'Lifestyle', icon: Coffee },
  { id: 'home', label: 'Home & Family', icon: Home },
  { id: 'other', label: 'Other', icon: Target },
];

const TIMEFRAME_OPTIONS = [
  { id: 'weekly', label: 'Weekly', description: 'Complete within a week' },
  { id: 'monthly', label: 'Monthly', description: 'Complete within a month' },
  { id: 'quarterly', label: 'Quarterly', description: 'Complete within a quarter' },
  { id: 'yearly', label: 'Yearly', description: 'Complete within a year' },
  { id: 'custom', label: 'Custom', description: 'Set your own deadline' },
];

const QUARTER_OPTIONS = [
  { id: 'Q1', label: 'Q1', description: 'Jan - Mar' },
  { id: 'Q2', label: 'Q2', description: 'Apr - Jun' },
  { id: 'Q3', label: 'Q3', description: 'Jul - Sep' },
  { id: 'Q4', label: 'Q4', description: 'Oct - Dec' },
];

export default function GoalForm({ goal, onSave, onCancel, isEditing = false }: GoalFormProps) {
  const [title, setTitle] = useState(goal?.title || '');
  const [description, setDescription] = useState(goal?.description || '');
  const [type, setType] = useState<'quantifiable' | 'non-quantifiable'>(goal?.type || 'quantifiable');
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'>(goal?.timeframe || 'monthly');
  const [quarter, setQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>(goal?.quarter || 'Q1');
  const [deadline, setDeadline] = useState<Date | null>(goal?.deadline || null);
  const [category, setCategory] = useState(goal?.category || 'personal');
  const [customCategory, setCustomCategory] = useState(goal?.customCategory || '');
  const [selectedColor, setSelectedColor] = useState(goal?.color || GOAL_COLORS[0]);
  const [targetNumber, setTargetNumber] = useState(goal?.targetNumber?.toString() || '');
  const [unit, setUnit] = useState(goal?.unit || '');
  const [showCalendar, setShowCalendar] = useState(false);
  const { colors } = useTheme();

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    if (timeframe === 'custom' && !deadline) {
      Alert.alert('Error', 'Please select a deadline for custom timeframe');
      return;
    }

    if (type === 'quantifiable') {
      const target = parseFloat(targetNumber);
      if (!targetNumber || isNaN(target) || target <= 0) {
        Alert.alert('Error', 'Please enter a valid target number');
        return;
      }
      if (!unit.trim()) {
        Alert.alert('Error', 'Please enter a unit of measurement');
        return;
      }
    }

    if (category === 'other' && !customCategory.trim()) {
      Alert.alert('Error', 'Please enter a custom category');
      return;
    }

    const goalData: Omit<Goal, 'id' | 'createdAt'> = {
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      timeframe,
      quarter: timeframe === 'quarterly' ? quarter : undefined,
      deadline: timeframe === 'custom' ? deadline : undefined,
      category: category === 'other' ? customCategory.trim() : category,
      customCategory: category === 'other' ? customCategory.trim() : undefined,
      color: selectedColor,
      targetNumber: type === 'quantifiable' ? parseFloat(targetNumber) : undefined,
      unit: type === 'quantifiable' ? unit.trim() : undefined,
      currentProgress: type === 'quantifiable' ? 0 : undefined,
      contributedHours: type === 'non-quantifiable' ? 0 : undefined,
      contributedTasks: type === 'non-quantifiable' ? 0 : undefined,
      estimatedProgress: type === 'non-quantifiable' ? 0 : undefined,
      isCompleted: false,
    };

    onSave(goalData);
  };

  const formatDeadline = (date: Date | null) => {
    if (!date) return 'Select deadline';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDateSelect = (selectedDate: Date) => {
    setDeadline(selectedDate);
    setShowCalendar(false);
  };

  const getCategoryLabel = () => {
    if (category === 'other') return customCategory || 'Other';
    const categoryObj = GOAL_CATEGORIES.find(cat => cat.id === category);
    return categoryObj?.label || 'Personal Development';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isEditing ? 'Edit Goal' : 'Create New Goal'}
        </Text>
        <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.card }]} onPress={onCancel} activeOpacity={0.7}>
          <X size={20} color={colors.textSecondary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Goal Title */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Goal Title *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.borderLight, color: colors.text }]}
            placeholder="What do you want to achieve?"
            placeholderTextColor={colors.textTertiary}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.card, borderColor: colors.borderLight, color: colors.text }]}
            placeholder="Describe your goal in detail (optional)"
            placeholderTextColor={colors.textTertiary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Goal Type */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Goal Type *</Text>
          <Text style={[styles.helpText, { color: colors.textSecondary }]}>How do you want to track this goal?</Text>

          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeOption,
                { backgroundColor: colors.card, borderColor: colors.borderLight },
                type === 'quantifiable' && { borderColor: colors.primary, backgroundColor: colors.primaryLight }
              ]}
              onPress={() => setType('quantifiable')}
              activeOpacity={0.7}
            >
              <BarChart3
                size={20}
                color={type === 'quantifiable' ? colors.primary : colors.textSecondary}
                strokeWidth={2}
              />
              <View style={styles.typeContent}>
                <Text style={[
                  styles.typeTitle,
                  { color: colors.text },
                  type === 'quantifiable' && { color: colors.primary }
                ]}>
                  Quantifiable Goal
                </Text>
                <Text style={[styles.typeDescription, { color: colors.textSecondary }]}>
                  Track with specific numbers (e.g., "Read 12 books", "Save $5000")
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeOption,
                { backgroundColor: colors.card, borderColor: colors.borderLight },
                type === 'non-quantifiable' && { borderColor: colors.primary, backgroundColor: colors.primaryLight }
              ]}
              onPress={() => setType('non-quantifiable')}
              activeOpacity={0.7}
            >
              <Target
                size={20}
                color={type === 'non-quantifiable' ? colors.primary : colors.textSecondary}
                strokeWidth={2}
              />
              <View style={styles.typeContent}>
                <Text style={[
                  styles.typeTitle,
                  { color: colors.text },
                  type === 'non-quantifiable' && { color: colors.primary }
                ]}>
                  Non-Quantifiable Goal
                </Text>
                <Text style={[styles.typeDescription, { color: colors.textSecondary }]}>
                  Track with time and tasks (e.g., "Learn Spanish", "Get promoted")
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quantifiable Goal Fields */}
        {type === 'quantifiable' && (
          <>
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>Target Number *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.borderLight, color: colors.text }]}
                placeholder="How much do you want to achieve?"
                placeholderTextColor={colors.textTertiary}
                value={targetNumber}
                onChangeText={setTargetNumber}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>Unit *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.borderLight, color: colors.text }]}
                placeholder="books, dollars, pounds, etc."
                placeholderTextColor={colors.textTertiary}
                value={unit}
                onChangeText={setUnit}
              />
            </View>
          </>
        )}

        {/* Timeframe */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Timeframe *</Text>
          <Text style={[styles.helpText, { color: colors.textSecondary }]}>When do you want to complete this goal?</Text>

          <View style={styles.timeframeContainer}>
            {TIMEFRAME_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.timeframeOption,
                  { backgroundColor: colors.card, borderColor: colors.borderLight },
                  timeframe === option.id && { borderColor: colors.primary, backgroundColor: colors.primaryLight }
                ]}
                onPress={() => setTimeframe(option.id as any)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.timeframeLabel,
                  { color: colors.text },
                  timeframe === option.id && { color: colors.primary }
                ]}>
                  {option.label}
                </Text>
                <Text style={[styles.timeframeDescription, { color: colors.textSecondary }]}>
                  {option.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quarter Selection for Quarterly Goals */}
          {timeframe === 'quarterly' && (
            <View style={styles.quarterContainer}>
              <Text style={[styles.quarterLabel, { color: colors.text }]}>Select Quarter</Text>
              <View style={styles.quarterGrid}>
                {QUARTER_OPTIONS.map((quarterOption) => (
                  <TouchableOpacity
                    key={quarterOption.id}
                    style={[
                      styles.quarterOption,
                      { backgroundColor: colors.card, borderColor: colors.borderLight },
                      quarter === quarterOption.id && { borderColor: colors.primary, backgroundColor: colors.primaryLight }
                    ]}
                    onPress={() => setQuarter(quarterOption.id as any)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.quarterOptionLabel,
                      { color: colors.text },
                      quarter === quarterOption.id && { color: colors.primary }
                    ]}>
                      {quarterOption.label}
                    </Text>
                    <Text style={[styles.quarterOptionDescription, { color: colors.textSecondary }]}>
                      {quarterOption.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Custom Deadline for Custom Timeframe */}
          {timeframe === 'custom' && (
            <View style={styles.deadlineContainer}>
              <Text style={[styles.deadlineLabel, { color: colors.text }]}>Deadline</Text>
              <TouchableOpacity
                style={[styles.deadlineButton, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
                onPress={() => setShowCalendar(true)}
                activeOpacity={0.7}
              >
                <Calendar size={16} color={colors.textSecondary} strokeWidth={2} />
                <Text style={[
                  styles.deadlineButtonText, 
                  { color: deadline ? colors.text : colors.textTertiary }
                ]}>
                  {formatDeadline(deadline)}
                </Text>
                <ChevronDown size={16} color={colors.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Category *</Text>
          <View style={styles.categoryContainer}>
            {GOAL_CATEGORIES.map((categoryOption) => {
              const IconComponent = categoryOption.icon;
              return (
                <TouchableOpacity
                  key={categoryOption.id}
                  style={[
                    styles.categoryOption,
                    { backgroundColor: colors.card, borderColor: colors.borderLight },
                    category === categoryOption.id && { borderColor: colors.primary, backgroundColor: colors.primaryLight }
                  ]}
                  onPress={() => setCategory(categoryOption.id)}
                  activeOpacity={0.7}
                >
                  <IconComponent
                    size={20}
                    color={category === categoryOption.id ? colors.primary : colors.textSecondary}
                    strokeWidth={2}
                  />
                  <Text style={[
                    styles.categoryLabel,
                    { color: colors.text },
                    category === categoryOption.id && { color: colors.primary }
                  ]}>
                    {categoryOption.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {category === 'other' && (
            <View style={styles.customCategoryContainer}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.borderLight, color: colors.text }]}
                placeholder="Enter custom category"
                placeholderTextColor={colors.textTertiary}
                value={customCategory}
                onChangeText={setCustomCategory}
              />
            </View>
          )}
        </View>

        {/* Color Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Color</Text>
          <View style={styles.colorContainer}>
            {GOAL_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColorOption
                ]}
                onPress={() => setSelectedColor(color)}
                activeOpacity={0.7}
              >
                {selectedColor === color && (
                  <Palette size={16} color="#FFFFFF" strokeWidth={2} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionButtons, { borderTopColor: colors.borderLight }]}>
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: colors.card }]}
          onPress={onCancel}
          activeOpacity={0.7}
        >
          <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: selectedColor }]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>
            {isEditing ? 'Update Goal' : 'Create Goal'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Modal */}
      <Modal
        visible={showCalendar}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowCalendar(false)}
      >
        <CalendarView
          selectedDate={deadline || new Date()}
          onDateSelect={handleDateSelect}
          onClose={() => setShowCalendar(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    paddingVertical: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    marginBottom: 12,
  },
  input: {
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeContainer: {
    gap: 12,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
  },
  typeContent: {
    flex: 1,
    marginLeft: 12,
  },
  typeTitle: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    lineHeight: 18,
  },
  timeframeContainer: {
    gap: 8,
  },
  timeframeOption: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
  },
  timeframeLabel: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 2,
  },
  timeframeDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  quarterContainer: {
    marginTop: 16,
  },
  quarterLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 12,
  },
  quarterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quarterOption: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  quarterOptionLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#374151',
    marginBottom: 2,
  },
  quarterOptionDescription: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  deadlineContainer: {
    marginTop: 16,
  },
  deadlineLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  deadlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  deadlineButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginLeft: 6,
  },
  customCategoryContainer: {
    marginTop: 12,
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});