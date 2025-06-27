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
import { X, Target, SquareCheck as CheckSquare, Calendar, Plus, Trash2, ChevronLeft, ChevronRight, Clock } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'quantifiable' | 'non-quantifiable';
  // For quantifiable goals
  targetNumber?: number;
  unit?: string;
  currentProgress?: number;
  // For non-quantifiable goals
  contributedHours?: number;
  contributedTasks?: number;
  estimatedProgress?: number; // Percentage estimation (0-100)
  // Common fields
  deadline?: Date;
  timeframe: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  category: string;
  customCategory?: string;
  color: string;
  isCompleted: boolean;
  createdAt: Date;
}

interface GoalFormProps {
  goal: Goal | null;
  onSave: (goalData: Omit<Goal, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  isEditing: boolean;
}

const DEFAULT_CATEGORIES = [
  { name: 'Health', color: '#10B981' },
  { name: 'Work', color: '#06B6D4' },
  { name: 'Learning', color: '#8B5CF6' },
  { name: 'Personal', color: '#F59E0B' },
  { name: 'Fitness', color: '#84CC16' },
];

const TIMEFRAME_OPTIONS = [
  { 
    id: 'weekly', 
    label: 'Weekly', 
    description: 'Complete within this week',
    color: '#EF4444',
    icon: Calendar
  },
  { 
    id: 'monthly', 
    label: 'Monthly', 
    description: 'Complete within this month',
    color: '#F59E0B',
    icon: Calendar
  },
  { 
    id: 'quarterly', 
    label: 'Quarterly', 
    description: 'Complete within 3 months',
    color: '#8B5CF6',
    icon: Calendar
  },
  { 
    id: 'yearly', 
    label: 'Yearly', 
    description: 'Complete within this year',
    color: '#06B6D4',
    icon: Calendar
  },
  { 
    id: 'custom', 
    label: 'Custom Date', 
    description: 'Set your own deadline',
    color: '#6B7280',
    icon: Clock
  },
];

export default function GoalForm({ goal, onSave, onCancel, isEditing }: GoalFormProps) {
  // Basic fields
  const [title, setTitle] = useState(goal?.title || '');
  const [description, setDescription] = useState(goal?.description || '');
  const [goalType, setGoalType] = useState<'quantifiable' | 'non-quantifiable'>(
    goal?.type || 'quantifiable'
  );

  // Timeframe selection
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'>(
    goal?.timeframe || 'monthly'
  );

  // Quantifiable goal fields
  const [targetNumber, setTargetNumber] = useState(goal?.targetNumber?.toString() || '');
  const [unit, setUnit] = useState(goal?.unit || '');
  const [currentProgress, setCurrentProgress] = useState(goal?.currentProgress?.toString() || '0');

  // Non-quantifiable goal fields
  const [contributedHours, setContributedHours] = useState(goal?.contributedHours?.toString() || '0');
  const [contributedTasks, setContributedTasks] = useState(goal?.contributedTasks?.toString() || '0');
  const [estimatedProgress, setEstimatedProgress] = useState(goal?.estimatedProgress?.toString() || '0');

  // Common fields
  const [deadline, setDeadline] = useState<Date | null>(goal?.deadline || null);
  const [selectedCategory, setSelectedCategory] = useState(goal?.category || DEFAULT_CATEGORIES[0].name);
  const [customCategory, setCustomCategory] = useState(goal?.customCategory || '');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { colors } = useTheme();

  // Get available categories (default + custom)
  const [customCategories, setCustomCategories] = useState<Array<{name: string, color: string}>>([]);
  
  const allCategories = [
    ...DEFAULT_CATEGORIES,
    ...customCategories,
    ...(showCustomCategory ? [] : [{ name: 'Custom...', color: '#6B7280' }])
  ];

  const selectedCategoryData = allCategories.find(cat => cat.name === selectedCategory) || DEFAULT_CATEGORIES[0];
  const selectedTimeframeData = TIMEFRAME_OPTIONS.find(tf => tf.id === timeframe) || TIMEFRAME_OPTIONS[1];

  // Calculate automatic deadline based on timeframe
  const getAutomaticDeadline = (selectedTimeframe: string): Date => {
    const now = new Date();
    
    switch (selectedTimeframe) {
      case 'weekly':
        // End of current week (Sunday at 11:59 PM)
        const endOfWeek = new Date(now);
        const daysUntilSunday = (7 - now.getDay()) % 7;
        endOfWeek.setDate(now.getDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday));
        endOfWeek.setHours(23, 59, 59, 999);
        return endOfWeek;
        
      case 'monthly':
        // End of current month at 11:59 PM
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        endOfMonth.setHours(23, 59, 59, 999);
        return endOfMonth;
        
      case 'quarterly':
        // End of current quarter at 11:59 PM
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const endOfQuarter = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0, 23, 59, 59, 999);
        endOfQuarter.setHours(23, 59, 59, 999);
        return endOfQuarter;
        
      case 'yearly':
        // End of current year at 11:59 PM
        const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        endOfYear.setHours(23, 59, 59, 999);
        return endOfYear;
        
      default:
        // Default to end of current day
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        return endOfDay;
    }
  };

  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe as any);
    
    if (newTimeframe !== 'custom') {
      // Automatically set deadline based on timeframe
      setDeadline(getAutomaticDeadline(newTimeframe));
    } else {
      // For custom, clear deadline so user can set their own
      setDeadline(null);
    }
  };

  const handleCategorySelect = (categoryName: string) => {
    if (categoryName === 'Custom...') {
      setShowCustomCategory(true);
      setSelectedCategory('');
    } else {
      setSelectedCategory(categoryName);
      setShowCustomCategory(false);
      setCustomCategory('');
    }
  };

  const handleCustomCategoryAdd = () => {
    if (!customCategory.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    const newCategory = {
      name: customCategory.trim(),
      color: '#6366F1' // Default color for custom categories
    };

    setCustomCategories(prev => [...prev, newCategory]);
    setSelectedCategory(newCategory.name);
    setShowCustomCategory(false);
    setCustomCategory('');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDateSelect = (selectedDate: Date) => {
    setDeadline(selectedDate);
    setShowDatePicker(false);
  };

  const clearDeadline = () => {
    setDeadline(null);
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return false;
    }

    if (goalType === 'quantifiable') {
      const targetNum = parseInt(targetNumber, 10);
      if (!targetNumber || isNaN(targetNum) || targetNum <= 0) {
        Alert.alert('Error', 'Please enter a valid target number');
        return false;
      }

      if (!unit.trim()) {
        Alert.alert('Error', 'Please enter a unit of measurement');
        return false;
      }

      if (isEditing) {
        const progressNum = parseInt(currentProgress, 10);
        if (isNaN(progressNum) || progressNum < 0) {
          Alert.alert('Error', 'Please enter a valid current progress');
          return false;
        }
      }
    }

    if (goalType === 'non-quantifiable' && isEditing) {
      const hoursNum = parseInt(contributedHours, 10);
      const tasksNum = parseInt(contributedTasks, 10);
      const estimationNum = parseInt(estimatedProgress, 10);
      
      if (isNaN(hoursNum) || hoursNum < 0) {
        Alert.alert('Error', 'Please enter a valid number of contributed hours');
        return false;
      }
      
      if (isNaN(tasksNum) || tasksNum < 0) {
        Alert.alert('Error', 'Please enter a valid number of contributed tasks');
        return false;
      }

      if (isNaN(estimationNum) || estimationNum < 0 || estimationNum > 100) {
        Alert.alert('Error', 'Please enter a valid progress estimation (0-100%)');
        return false;
      }
    }

    if (timeframe === 'custom' && !deadline) {
      Alert.alert('Error', 'Please set a deadline for custom timeframe');
      return false;
    }

    if (showCustomCategory && !customCategory.trim()) {
      Alert.alert('Error', 'Please enter a custom category name or select an existing category');
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const finalCategory = showCustomCategory ? customCategory.trim() : selectedCategory;
    const finalCategoryColor = showCustomCategory ? '#6366F1' : selectedCategoryData.color;

    const goalData: Omit<Goal, 'id' | 'createdAt'> = {
      title: title.trim(),
      description: description.trim(),
      type: goalType,
      timeframe,
      category: finalCategory,
      customCategory: showCustomCategory ? customCategory.trim() : undefined,
      color: finalCategoryColor,
      deadline,
      isCompleted: false,
    };

    if (goalType === 'quantifiable') {
      const targetNum = parseInt(targetNumber, 10);
      const progressNum = isEditing ? parseInt(currentProgress, 10) : 0;
      
      goalData.targetNumber = targetNum;
      goalData.unit = unit.trim();
      goalData.currentProgress = Math.min(progressNum, targetNum);
      goalData.isCompleted = progressNum >= targetNum;
    } else {
      // For non-quantifiable goals, set contributed hours, tasks, and estimation
      const hoursNum = isEditing ? parseInt(contributedHours, 10) : 0;
      const tasksNum = isEditing ? parseInt(contributedTasks, 10) : 0;
      const estimationNum = isEditing ? parseInt(estimatedProgress, 10) : 0;
      
      goalData.contributedHours = hoursNum;
      goalData.contributedTasks = tasksNum;
      goalData.estimatedProgress = estimationNum;
      goalData.isCompleted = estimationNum >= 100;
    }

    onSave(goalData);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isEditing ? 'Edit Goal' : 'Create New Goal'}
        </Text>
        <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.card }]} onPress={onCancel} activeOpacity={0.7}>
          <X size={20} color={colors.textSecondary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Extra notes or personal motivation (optional)"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Timeframe Selection - Now positioned after title and description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Goal Timeframe *</Text>
          <Text style={styles.helpText}>When do you want to achieve this goal?</Text>
          
          <View style={styles.timeframeContainer}>
            {TIMEFRAME_OPTIONS.map((option) => {
              const IconComponent = option.icon;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.timeframeOption,
                    { borderColor: option.color + '40' },
                    timeframe === option.id && { 
                      borderColor: option.color,
                      backgroundColor: option.color + '10'
                    }
                  ]}
                  onPress={() => handleTimeframeChange(option.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.timeframeHeader}>
                    <IconComponent 
                      size={16} 
                      color={option.color} 
                      strokeWidth={2} 
                    />
                    <Text style={[
                      styles.timeframeLabel,
                      { color: option.color },
                      timeframe === option.id && styles.timeframeLabelSelected
                    ]}>
                      {option.label}
                    </Text>
                  </View>
                  <Text style={styles.timeframeDescription}>
                    {option.description}
                  </Text>
                  {timeframe === option.id && deadline && (
                    <View style={styles.timeframeDeadline}>
                      <Calendar size={12} color={option.color} strokeWidth={2} />
                      <Text style={[styles.timeframeDeadlineText, { color: option.color }]}>
                        Due: {formatDate(deadline)}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Custom Date Selection - Only show for custom timeframe */}
        {timeframe === 'custom' && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Custom Deadline *</Text>
            {deadline ? (
              <View style={styles.deadlineContainer}>
                <View style={styles.deadlineDisplay}>
                  <Calendar size={16} color="#4F46E5" strokeWidth={2} />
                  <Text style={styles.deadlineText}>{formatDate(deadline)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deadlineAction}
                  onPress={clearDeadline}
                  activeOpacity={0.7}
                >
                  <Trash2 size={14} color="#EF4444" strokeWidth={2} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.deadlineButton}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Calendar size={16} color="#6B7280" strokeWidth={2} />
                <Text style={styles.deadlineButtonText}>Set custom deadline</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Goal Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Goal Type *</Text>
          <Text style={styles.helpText}>How do you want to track progress?</Text>
          
          <View style={styles.goalTypeContainer}>
            <TouchableOpacity
              style={[
                styles.goalTypeOption,
                goalType === 'quantifiable' && styles.goalTypeOptionSelected
              ]}
              onPress={() => setGoalType('quantifiable')}
              activeOpacity={0.7}
            >
              <View style={styles.goalTypeIconContainer}>
                <Target 
                  size={20} 
                  color={goalType === 'quantifiable' ? '#4F46E5' : '#6B7280'} 
                  strokeWidth={2} 
                />
              </View>
              <View style={styles.goalTypeContent}>
                <Text style={[
                  styles.goalTypeTitle,
                  goalType === 'quantifiable' && styles.goalTypeTitleSelected
                ]}>
                  Quantifiable
                </Text>
                <Text style={styles.goalTypeDescription}>
                  Track progress with measurable numbers
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.goalTypeOption,
                goalType === 'non-quantifiable' && styles.goalTypeOptionSelected
              ]}
              onPress={() => setGoalType('non-quantifiable')}
              activeOpacity={0.7}
            >
              <View style={styles.goalTypeIconContainer}>
                <CheckSquare 
                  size={20} 
                  color={goalType === 'non-quantifiable' ? '#4F46E5' : '#6B7280'} 
                  strokeWidth={2} 
                />
              </View>
              <View style={styles.goalTypeContent}>
                <Text style={[
                  styles.goalTypeTitle,
                  goalType === 'non-quantifiable' && styles.goalTypeTitleSelected
                ]}>
                  Contribution-Based
                </Text>
                <Text style={styles.goalTypeDescription}>
                  Track hours and tasks contributed to this goal
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quantifiable Goal Fields */}
        {goalType === 'quantifiable' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Target Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="How much?"
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
                placeholder="What is being measured?"
                placeholderTextColor="#9CA3AF"
                value={unit}
                onChangeText={setUnit}
              />
            </View>

            {isEditing && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Current Progress</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Current progress"
                  placeholderTextColor="#9CA3AF"
                  value={currentProgress}
                  onChangeText={setCurrentProgress}
                  keyboardType="numeric"
                />
              </View>
            )}
          </>
        )}

        {/* Non-Quantifiable Goal Fields */}
        {goalType === 'non-quantifiable' && (
          <>
            {isEditing ? (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Contributed Hours</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Hours contributed to this goal"
                    placeholderTextColor="#9CA3AF"
                    value={contributedHours}
                    onChangeText={setContributedHours}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Contributed Tasks</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Tasks completed for this goal"
                    placeholderTextColor="#9CA3AF"
                    value={contributedTasks}
                    onChangeText={setContributedTasks}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Progress Estimation (%)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="How complete is this goal? (0-100%)"
                    placeholderTextColor="#9CA3AF"
                    value={estimatedProgress}
                    onChangeText={setEstimatedProgress}
                    keyboardType="numeric"
                  />
                </View>
              </>
            ) : (
              <View style={styles.section}>
                <View style={styles.infoCard}>
                  <CheckSquare size={16} color="#6B7280" strokeWidth={2} />
                  <Text style={styles.infoText}>
                    Progress will be tracked by hours and tasks you contribute to this goal. 
                    You can link tasks from your Task Page and log time spent working on this goal.
                  </Text>
                </View>
              </View>
            )}
          </>
        )}

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Category</Text>
          
          {showCustomCategory ? (
            <View style={styles.customCategoryContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter custom category"
                placeholderTextColor="#9CA3AF"
                value={customCategory}
                onChangeText={setCustomCategory}
                autoFocus
              />
              <TouchableOpacity
                style={styles.customCategoryButton}
                onPress={handleCustomCategoryAdd}
                activeOpacity={0.7}
              >
                <Plus size={16} color="#4F46E5" strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.customCategoryCancelButton}
                onPress={() => {
                  setShowCustomCategory(false);
                  setCustomCategory('');
                  setSelectedCategory(DEFAULT_CATEGORIES[0].name);
                }}
                activeOpacity={0.7}
              >
                <X size={16} color="#6B7280" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {allCategories.map((category) => (
                <TouchableOpacity
                  key={category.name}
                  style={[
                    styles.categoryOption,
                    { backgroundColor: category.color + '20' },
                    selectedCategory === category.name && styles.selectedCategoryOption
                  ]}
                  onPress={() => handleCategorySelect(category.name)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.categoryOptionText,
                    { color: category.color },
                    selectedCategory === category.name && styles.selectedCategoryText
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
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
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>
            {isEditing ? 'Update Goal' : 'Create Goal'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Enhanced Date Picker Modal */}
      <EnhancedDatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onDateSelect={handleDateSelect}
        currentDate={deadline}
      />
    </SafeAreaView>
  );
}

function EnhancedDatePickerModal({ 
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
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(currentDate || today);
  const [currentMonth, setCurrentMonth] = useState(
    new Date(currentDate?.getFullYear() || today.getFullYear(), currentDate?.getMonth() || today.getMonth(), 1)
  );
  const [selectedYear, setSelectedYear] = useState(currentDate?.getFullYear() || today.getFullYear());

  // Generate years from current year to 10 years in the future
  const availableYears = Array.from({ length: 11 }, (_, i) => today.getFullYear() + i);

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
    setSelectedYear(newMonth.getFullYear());
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    const newMonth = new Date(year, currentMonth.getMonth(), 1);
    setCurrentMonth(newMonth);
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date | null) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isPastDate = (date: Date | null) => {
    if (!date) return false;
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return dateOnly < todayOnly;
  };

  const handleDatePress = (date: Date) => {
    setSelectedDate(date);
  };

  const handleConfirm = () => {
    onDateSelect(selectedDate);
  };

  const goToToday = () => {
    const todayDate = new Date();
    setSelectedDate(todayDate);
    setCurrentMonth(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));
    setSelectedYear(todayDate.getFullYear());
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.datePickerContainer}>
          {/* Header */}
          <View style={styles.datePickerHeader}>
            <Text style={styles.datePickerTitle}>Select Deadline</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <X size={20} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Year Selection */}
          <View style={styles.yearSelectionContainer}>
            <Text style={styles.yearSelectionLabel}>Year</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.yearScroll}
              contentContainerStyle={styles.yearScrollContent}
            >
              {availableYears.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.yearOption,
                    selectedYear === year && styles.selectedYearOption
                  ]}
                  onPress={() => handleYearChange(year)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.yearOptionText,
                    selectedYear === year && styles.selectedYearOptionText
                  ]}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Calendar Navigation */}
          <View style={styles.calendarHeader}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateMonth('prev')}
              activeOpacity={0.7}
            >
              <ChevronLeft size={18} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
            
            <Text style={styles.monthTitle}>{formatMonth(currentMonth)}</Text>
            
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateMonth('next')}
              activeOpacity={0.7}
            >
              <ChevronRight size={18} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.todayButton}
              onPress={goToToday}
              activeOpacity={0.8}
            >
              <Clock size={12} color="#4F46E5" strokeWidth={2} />
              <Text style={styles.todayButtonText}>Go to Today</Text>
            </TouchableOpacity>
          </View>

          {/* Week Days Header */}
          <View style={styles.weekDaysContainer}>
            {weekDays.map((day) => (
              <Text key={day} style={styles.weekDay}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {days.map((date, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  !date && styles.emptyCell,
                  isToday(date) && styles.todayCell,
                  isSelected(date) && styles.selectedCell,
                  isPastDate(date) && styles.pastDateCell,
                ]}
                onPress={() => date && !isPastDate(date) && handleDatePress(date)}
                disabled={!date || isPastDate(date)}
                activeOpacity={0.7}
              >
                {date && (
                  <Text style={[
                    styles.dayText,
                    isToday(date) && styles.todayText,
                    isSelected(date) && styles.selectedText,
                    isPastDate(date) && styles.pastDateText,
                  ]}>
                    {date.getDate()}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Selected Date Display */}
          <View style={styles.selectedDateContainer}>
            <Text style={styles.selectedDateLabel}>Selected Deadline</Text>
            <Text style={styles.selectedDateText}>
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>

          {/* Action Buttons */}
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
    flex: 1,
    paddingHorizontal: 20,
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
  helpText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  // Timeframe Selection Styles
  timeframeContainer: {
    gap: 8,
    marginTop: 8,
  },
  timeframeOption: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
  },
  timeframeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeframeLabel: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  timeframeLabelSelected: {
    fontFamily: 'Inter-Bold',
  },
  timeframeDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 24,
  },
  timeframeDeadline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 24,
  },
  timeframeDeadlineText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 4,
  },
  goalTypeContainer: {
    gap: 12,
    marginTop: 8,
  },
  goalTypeOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
  },
  goalTypeOptionSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  goalTypeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  goalTypeContent: {
    flex: 1,
  },
  goalTypeTitle: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 4,
  },
  goalTypeTitleSelected: {
    color: '#4F46E5',
  },
  goalTypeDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    lineHeight: 18,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#0369A1',
    lineHeight: 18,
    marginLeft: 8,
    flex: 1,
  },
  deadlineContainer: {
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
  deadlineDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deadlineText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginLeft: 8,
  },
  deadlineAction: {
    padding: 4,
  },
  deadlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  customCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customCategoryButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  customCategoryCancelButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryScroll: {
    marginTop: 4,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedCategoryOption: {
    borderColor: '#4F46E5',
  },
  categoryOptionText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedCategoryText: {
    color: '#4F46E5',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
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
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  // Enhanced Date Picker Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
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
  yearSelectionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#F8FAFC',
  },
  yearSelectionLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  yearScroll: {
    maxHeight: 40,
  },
  yearScrollContent: {
    paddingRight: 20,
  },
  yearOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedYearOption: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  yearOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  selectedYearOptionText: {
    color: '#FFFFFF',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  quickActions: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  todayButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#4F46E5',
    marginLeft: 4,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    paddingVertical: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 4,
  },
  emptyCell: {
    opacity: 0,
  },
  todayCell: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  selectedCell: {
    backgroundColor: '#4F46E5',
  },
  pastDateCell: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  todayText: {
    color: '#F59E0B',
    fontFamily: 'Inter-SemiBold',
  },
  selectedText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  pastDateText: {
    color: '#9CA3AF',
  },
  selectedDateContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedDateLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedDateText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  datePickerActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#4F46E5',
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