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
import {
  X,
  Target,
  Calendar,
  Palette,
  ChevronDown
} from 'lucide-react-native';
import { Goal } from '@/types/goal';

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

const TIMEFRAME_OPTIONS = [
  { id: 'weekly', label: 'Weekly', description: 'Complete within a week' },
  { id: 'monthly', label: 'Monthly', description: 'Complete within a month' },
  { id: 'quarterly', label: 'Quarterly', description: 'Complete within 3 months' },
  { id: 'yearly', label: 'Yearly', description: 'Complete within a year' },
  { id: 'custom', label: 'Custom', description: 'Set a custom deadline' },
];

const CATEGORY_OPTIONS = [
  'Health & Fitness',
  'Learning & Education',
  'Career & Work',
  'Personal Development',
  'Relationships',
  'Finance',
  'Hobbies',
  'Travel',
  'Home & Family',
  'Other'
];

export default function GoalForm({ goal, onSave, onCancel, isEditing = false }: GoalFormProps) {
  const [title, setTitle] = useState(goal?.title || '');
  const [description, setDescription] = useState(goal?.description || '');
  const [type, setType] = useState<'quantifiable' | 'non-quantifiable'>(goal?.type || 'quantifiable');
  const [targetNumber, setTargetNumber] = useState(goal?.targetNumber?.toString() || '');
  const [unit, setUnit] = useState(goal?.unit || '');
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'>(goal?.timeframe || 'monthly');
  const [deadline, setDeadline] = useState<Date | null>(goal?.deadline || null);
  const [category, setCategory] = useState(goal?.category || CATEGORY_OPTIONS[0]);
  const [customCategory, setCustomCategory] = useState(goal?.customCategory || '');
  const [selectedColor, setSelectedColor] = useState(goal?.color || GOAL_COLORS[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a goal description');
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

    if (timeframe === 'custom' && !deadline) {
      Alert.alert('Error', 'Please set a deadline for custom timeframe');
      return;
    }

    const goalData: Omit<Goal, 'id' | 'createdAt'> = {
      title: title.trim(),
      description: description.trim(),
      type,
      targetNumber: type === 'quantifiable' ? parseFloat(targetNumber) : undefined,
      unit: type === 'quantifiable' ? unit.trim() : undefined,
      currentProgress: goal?.currentProgress || 0,
      contributedHours: goal?.contributedHours || 0,
      contributedTasks: goal?.contributedTasks || 0,
      estimatedProgress: goal?.estimatedProgress || 0,
      timeframe,
      deadline: timeframe === 'custom' ? deadline : undefined,
      category: category === 'Other' ? customCategory.trim() : category,
      customCategory: category === 'Other' ? customCategory.trim() : undefined,
      color: selectedColor,
      isCompleted: goal?.isCompleted || false,
    };

    onSave(goalData);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Goal' : 'Create New Goal'}
        </Text>
        <TouchableOpacity style={styles.closeButton} onPress={onCancel} activeOpacity={0.7}>
          <X size={20} color="#6B7280" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Goal Title */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Goal Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="What do you want to achieve?"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
        </View>

        {/* Goal Description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your goal in detail"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Goal Type */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Goal Type *</Text>
          <Text style={styles.helpText}>How do you want to measure progress?</Text>

          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeOption,
                type === 'quantifiable' && styles.selectedTypeOption
              ]}
              onPress={() => setType('quantifiable')}
              activeOpacity={0.7}
            >
              <Target
                size={20}
                color={type === 'quantifiable' ? '#6366F1' : '#6B7280'}
                strokeWidth={2}
              />
              <View style={styles.typeContent}>
                <Text style={[
                  styles.typeTitle,
                  type === 'quantifiable' && styles.selectedTypeTitle
                ]}>
                  Quantifiable Goal
                </Text>
                <Text style={styles.typeDescription}>
                  Measurable with numbers (e.g., "Read 12 books", "Run 100 miles")
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeOption,
                type === 'non-quantifiable' && styles.selectedTypeOption
              ]}
              onPress={() => setType('non-quantifiable')}
              activeOpacity={0.7}
            >
              <Target
                size={20}
                color={type === 'non-quantifiable' ? '#6366F1' : '#6B7280'}
                strokeWidth={2}
              />
              <View style={styles.typeContent}>
                <Text style={[
                  styles.typeTitle,
                  type === 'non-quantifiable' && styles.selectedTypeTitle
                ]}>
                  Non-Quantifiable Goal
                </Text>
                <Text style={styles.typeDescription}>
                  Progress tracked by tasks and time (e.g., "Learn Spanish", "Build a website")
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quantifiable Goal Fields */}
        {type === 'quantifiable' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Target Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="How many do you want to achieve?"
                placeholderTextColor="#9CA3AF"
                value={targetNumber}
                onChangeText={setTargetNumber}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Unit *</Text>
              <TextInput
                style={styles.input}
                placeholder="books, miles, hours, etc."
                placeholderTextColor="#9CA3AF"
                value={unit}
                onChangeText={setUnit}
              />
            </View>
          </>
        )}

        {/* Timeframe */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Timeframe *</Text>
          <Text style={styles.helpText}>When do you want to complete this goal?</Text>

          <View style={styles.timeframeContainer}>
            {TIMEFRAME_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.timeframeOption,
                  timeframe === option.id && styles.selectedTimeframeOption
                ]}
                onPress={() => setTimeframe(option.id as any)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.timeframeLabel,
                  timeframe === option.id && styles.selectedTimeframeLabel
                ]}>
                  {option.label}
                </Text>
                <Text style={styles.timeframeDescription}>
                  {option.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {timeframe === 'custom' && (
            <View style={styles.deadlineContainer}>
              <Text style={styles.deadlineLabel}>Custom Deadline</Text>
              {deadline ? (
                <View style={styles.deadlineDisplay}>
                  <Calendar size={16} color="#6366F1" strokeWidth={2} />
                  <Text style={styles.deadlineText}>{formatDate(deadline)}</Text>
                  <TouchableOpacity
                    style={styles.deadlineAction}
                    onPress={() => setDeadline(null)}
                    activeOpacity={0.7}
                  >
                    <X size={14} color="#EF4444" strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.deadlineButton}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Calendar size={16} color="#6B7280" strokeWidth={2} />
                  <Text style={styles.deadlineButtonText}>Set deadline</Text>
                  <ChevronDown size={16} color="#6B7280" strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.categoryContainer}>
            {CATEGORY_OPTIONS.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryOption,
                  category === cat && styles.selectedCategoryOption
                ]}
                onPress={() => setCategory(cat)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.categoryText,
                  category === cat && styles.selectedCategoryText
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {category === 'Other' && (
            <TextInput
              style={[styles.input, { marginTop: 12 }]}
              placeholder="Enter custom category"
              placeholderTextColor="#9CA3AF"
              value={customCategory}
              onChangeText={setCustomCategory}
            />
          )}
        </View>

        {/* Color Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Color</Text>
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
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
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

      {/* Simple Date Picker Modal */}
      <SimpleDatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onDateSelect={(date) => {
          setDeadline(date);
          setShowDatePicker(false);
        }}
        currentDate={deadline}
      />
    </SafeAreaView>
  );
}

// Simple Date Picker Modal Component
function SimpleDatePickerModal({
  visible,
  onClose,
  onDateSelect,
  currentDate
}: {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  currentDate: Date | null;
}) {
  const [selectedDate, setSelectedDate] = useState(currentDate || new Date());

  const handleConfirm = () => {
    onDateSelect(selectedDate);
  };

  const adjustDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.datePickerContainer}>
          <View style={styles.datePickerHeader}>
            <Text style={styles.datePickerTitle}>Set Deadline</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <X size={20} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.datePickerContent}>
            <Text style={styles.selectedDateText}>
              {formatDate(selectedDate)}
            </Text>

            <View style={styles.dateAdjustments}>
              <TouchableOpacity
                style={styles.dateAdjustButton}
                onPress={() => adjustDate(-7)}
                activeOpacity={0.7}
              >
                <Text style={styles.dateAdjustButtonText}>-1 Week</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dateAdjustButton}
                onPress={() => adjustDate(-1)}
                activeOpacity={0.7}
              >
                <Text style={styles.dateAdjustButtonText}>-1 Day</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dateAdjustButton}
                onPress={() => adjustDate(1)}
                activeOpacity={0.7}
              >
                <Text style={styles.dateAdjustButtonText}>+1 Day</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dateAdjustButton}
                onPress={() => adjustDate(7)}
                activeOpacity={0.7}
              >
                <Text style={styles.dateAdjustButtonText}>+1 Week</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quickDateOptions}>
              <TouchableOpacity
                style={styles.quickDateButton}
                onPress={() => {
                  const date = new Date();
                  date.setDate(date.getDate() + 7);
                  setSelectedDate(date);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.quickDateButtonText}>1 Week</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickDateButton}
                onPress={() => {
                  const date = new Date();
                  date.setMonth(date.getMonth() + 1);
                  setSelectedDate(date);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.quickDateButtonText}>1 Month</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickDateButton}
                onPress={() => {
                  const date = new Date();
                  date.setMonth(date.getMonth() + 3);
                  setSelectedDate(date);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.quickDateButtonText}>3 Months</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.datePickerActions}>
            <TouchableOpacity
              style={styles.datePickerCancelButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.datePickerCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.datePickerConfirmButton}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.datePickerConfirmText}>Set Deadline</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
    paddingHorizontal: 20,
  },
  scrollContent: {
    flexGrow: 1,
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
  selectedTypeOption: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
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
  selectedTypeTitle: {
    color: '#6366F1',
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
  selectedTimeframeOption: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  timeframeLabel: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 2,
  },
  selectedTimeframeLabel: {
    color: '#6366F1',
  },
  timeframeDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
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
  deadlineDisplay: {
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
  deadlineText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  deadlineAction: {
    padding: 4,
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
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedCategoryOption: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  categoryText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  selectedCategoryText: {
    color: '#6366F1',
    fontFamily: 'Inter-SemiBold',
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
  // Date Picker Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  datePickerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  datePickerContent: {
    padding: 20,
  },
  selectedDateText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  dateAdjustments: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateAdjustButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  dateAdjustButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  quickDateOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickDateButton: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  quickDateButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6366F1',
  },
  datePickerActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  datePickerCancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  datePickerCancelText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  datePickerConfirmButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  datePickerConfirmText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});