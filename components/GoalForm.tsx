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
  Calendar,
  Target,
  SquareCheck as CheckSquare,
  Palette,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import CalendarView from '@/components/CalendarView';
import { useTheme } from '@/contexts/ThemeContext';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

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
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4'; // For quarterly goals
  category: string;
  customCategory?: string;
  color: string;
  isCompleted: boolean;
  createdAt: Date;
}

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

const TIMEFRAME_COLORS = {
  weekly: '#EF4444',    // Red
  monthly: '#F59E0B',   // Orange
  quarterly: '#8B5CF6', // Purple
  yearly: '#06B6D4',    // Cyan
  custom: '#6B7280',    // Gray
};

const CATEGORIES = [
  'Health & Fitness',
  'Career & Professional',
  'Education & Learning',
  'Personal Development',
  'Relationships',
  'Finance',
  'Hobbies & Interests',
  'Travel & Adventure',
  'Home & Lifestyle',
  'Creativity & Arts',
  'Other',
];

const QUARTERS = [
  { id: 'Q1', label: 'Q1 (Jan-Mar)', months: 'January - March' },
  { id: 'Q2', label: 'Q2 (Apr-Jun)', months: 'April - June' },
  { id: 'Q3', label: 'Q3 (Jul-Sep)', months: 'July - September' },
  { id: 'Q4', label: 'Q4 (Oct-Dec)', months: 'October - December' },
];

export default function GoalForm({ goal, onSave, onCancel, isEditing = false }: GoalFormProps) {
  const [title, setTitle] = useState(goal?.title || '');
  const [description, setDescription] = useState(goal?.description || '');
  const [type, setType] = useState<'quantifiable' | 'non-quantifiable'>(goal?.type || 'quantifiable');
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'>(goal?.timeframe || 'monthly');
  const [quarter, setQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4' | undefined>(goal?.quarter);
  const [deadline, setDeadline] = useState<Date | null>(goal?.deadline || null);
  const [category, setCategory] = useState(goal?.category || CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState(goal?.customCategory || '');
  const [selectedColor, setSelectedColor] = useState(goal?.color || GOAL_COLORS[0]);
  const [targetNumber, setTargetNumber] = useState(goal?.targetNumber?.toString() || '');
  const [unit, setUnit] = useState(goal?.unit || '');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showQuarterDropdown, setShowQuarterDropdown] = useState(false);
  const { colors } = useTheme();

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    if (timeframe === 'quarterly' && !quarter) {
      Alert.alert('Error', 'Please select a quarter for quarterly goals');
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

    if (category === 'Other' && !customCategory.trim()) {
      Alert.alert('Error', 'Please enter a custom category');
      return;
    }

    const goalData: Omit<Goal, 'id' | 'createdAt'> = {
      title: title.trim(),
      description: description.trim(),
      type,
      targetNumber: type === 'quantifiable' ? parseFloat(targetNumber) : undefined,
      unit: type === 'quantifiable' ? unit.trim() : undefined,
      currentProgress: type === 'quantifiable' ? 0 : undefined,
      contributedHours: type === 'non-quantifiable' ? 0 : undefined,
      contributedTasks: type === 'non-quantifiable' ? 0 : undefined,
      estimatedProgress: type === 'non-quantifiable' ? 0 : undefined,
      deadline: deadline || undefined,
      timeframe,
      quarter: timeframe === 'quarterly' ? quarter : undefined,
      category: category === 'Other' ? customCategory.trim() : category,
      customCategory: category === 'Other' ? customCategory.trim() : undefined,
      color: selectedColor,
      isCompleted: false,
    };

    onSave(goalData);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Select deadline (optional)';
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

  const getTimeframeDescription = (timeframeId: string) => {
    const now = new Date();
    
    switch (timeframeId) {
      case 'weekly': {
        // Get the end of this week (Sunday)
        const endOfWeek = new Date(now);
        const daysUntilSunday = 7 - now.getDay();
        endOfWeek.setDate(now.getDate() + daysUntilSunday);
        return `Complete by ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      }
      case 'monthly': {
        // Get the end of this month
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return `Complete by ${endOfMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      }
      case 'quarterly': {
        return 'Complete within the selected quarter';
      }
      case 'yearly': {
        // Get the end of this year
        const endOfYear = new Date(now.getFullYear(), 11, 31);
        return `Complete by ${endOfYear.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      }
      case 'custom': {
        return 'Set your own deadline';
      }
      default:
        return '';
    }
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
              <Target
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
              <CheckSquare
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
                  Track with time and tasks (e.g., "Learn a new skill", "Improve health")
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
          <Text style={[styles.helpText, { color: colors.textSecondary }]}>When do you want to achieve this goal?</Text>

          <View style={styles.timeframeContainer}>
            {[
              { id: 'weekly', label: 'This Week' },
              { id: 'monthly', label: 'This Month' },
              { id: 'quarterly', label: 'This Quarter' },
              { id: 'yearly', label: 'This Year' },
              { id: 'custom', label: 'Custom' },
            ].map((option) => (
              <View key={option.id}>
                <TouchableOpacity
                  style={[
                    styles.timeframeOption,
                    { 
                      backgroundColor: colors.card, 
                      borderColor: colors.borderLight,
                      borderLeftColor: TIMEFRAME_COLORS[option.id as keyof typeof TIMEFRAME_COLORS],
                      borderLeftWidth: 4,
                    },
                    timeframe === option.id && { 
                      borderColor: TIMEFRAME_COLORS[option.id as keyof typeof TIMEFRAME_COLORS], 
                      backgroundColor: TIMEFRAME_COLORS[option.id as keyof typeof TIMEFRAME_COLORS] + '10',
                      borderLeftColor: TIMEFRAME_COLORS[option.id as keyof typeof TIMEFRAME_COLORS],
                    }
                  ]}
                  onPress={() => {
                    setTimeframe(option.id as any);
                    if (option.id !== 'quarterly') {
                      setQuarter(undefined);
                      setShowQuarterDropdown(false);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.timeframeContent}>
                    <View style={styles.timeframeHeader}>
                      <Text style={[
                    styles.timeframeLabel,
                        { color: colors.text },
                        timeframe === option.id && { color: TIMEFRAME_COLORS[option.id as keyof typeof TIMEFRAME_COLORS] }
                  ]}>
                    {option.label}
                  </Text>
                      <View style={[
                        styles.timeframeBadge,
                        { backgroundColor: TIMEFRAME_COLORS[option.id as keyof typeof TIMEFRAME_COLORS] + '20' }
                      ]}>
                        <Text style={[
                          styles.timeframeBadgeText,
                          { color: TIMEFRAME_COLORS[option.id as keyof typeof TIMEFRAME_COLORS] }
                        ]}>
                          {option.id.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.timeframeDescription, { color: colors.textSecondary }]}>
                      {getTimeframeDescription(option.id)}
                  </Text>
                  </View>
                </TouchableOpacity>

                {/* Quarter Selection - Positioned immediately after quarterly option */}
                {option.id === 'quarterly' && timeframe === 'quarterly' && (
                  <View style={styles.quarterSection}>
                    <Text style={[styles.quarterLabel, { color: colors.text }]}>Select Quarter *</Text>
                    
                    <View style={styles.quarterGrid}>
                      {QUARTERS.map((quarterOption) => (
                        <TouchableOpacity
                          key={quarterOption.id}
                          style={[
                            styles.quarterCard,
                            { backgroundColor: colors.card, borderColor: colors.borderLight },
                            quarter === quarterOption.id && { borderColor: colors.primary, backgroundColor: colors.primaryLight }
                          ]}
                          onPress={() => setQuarter(quarterOption.id as 'Q1' | 'Q2' | 'Q3' | 'Q4')}
                          activeOpacity={0.7}
                        >
                          <Text style={[
                            styles.quarterCardLabel,
                            { color: colors.text },
                            quarter === quarterOption.id && { color: colors.primary }
                          ]}>
                            {quarterOption.id}
                          </Text>
                          <Text style={[styles.quarterCardMonths, { color: colors.textSecondary }]}>
                            {quarterOption.months}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Deadline */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Deadline</Text>
          <Text style={[styles.helpText, { color: colors.textSecondary }]}>Set a specific deadline for your goal</Text>

          {deadline ? (
            <View style={styles.deadlineContainer}>
              <View style={styles.deadlineDisplay}>
                <Calendar size={16} color={colors.primary} strokeWidth={2} />
                <Text style={[styles.deadlineText, { color: colors.text }]}>{formatDate(deadline)}</Text>
              </View>
              <TouchableOpacity
                style={styles.deadlineAction}
                onPress={() => setDeadline(null)}
                activeOpacity={0.7}
              >
                <X size={14} color={colors.error} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.deadlineButton, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
              onPress={() => setShowCalendar(true)}
              activeOpacity={0.7}
            >
              <Calendar size={16} color={colors.textSecondary} strokeWidth={2} />
              <Text style={[styles.deadlineButtonText, { color: colors.textTertiary }]}>
                {formatDate(deadline)}
              </Text>
              <ChevronDown size={16} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Category *</Text>
          <View style={styles.categoryContainer}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryOption,
                  { backgroundColor: colors.card, borderColor: colors.borderLight },
                  category === cat && { borderColor: colors.primary, backgroundColor: colors.primaryLight }
                ]}
                onPress={() => setCategory(cat)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.categoryText,
                  { color: colors.text },
                  category === cat && { color: colors.primary }
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {category === 'Other' && (
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.borderLight, color: colors.text, marginTop: 12 }]}
              placeholder="Enter custom category"
              placeholderTextColor={colors.textTertiary}
              value={customCategory}
              onChangeText={setCustomCategory}
            />
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
      <View style={[styles.actionButtons, { borderTopColor: colors.borderLight, backgroundColor: colors.surface }]}>
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

      {/* Calendar Modal - Full Screen */}
      <Modal
        visible={showCalendar}
        animationType="slide"
        presentationStyle="pageSheet"
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  timeframeContent: {
    flex: 1,
  },
  timeframeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeframeLabel: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    flex: 1,
  },
  timeframeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  timeframeBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeframeDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    lineHeight: 18,
  },
  quarterSection: {
    marginTop: 12,
    paddingTop: 12,
  },
  quarterLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  quarterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quarterCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  quarterCardLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#374151',
    marginBottom: 4,
  },
  quarterCardMonths: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  quarterDropdownButton: {
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
  quarterDropdownText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    flex: 1,
  },
  quarterDropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  quarterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  quarterOptionLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 2,
  },
  quarterOptionMonths: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
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
    color: '#9CA3AF',
    marginLeft: 8,
    flex: 1,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#374151',
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