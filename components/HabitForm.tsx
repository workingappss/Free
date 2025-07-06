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
  Clock,
  Target,
  SquareCheck as CheckSquare,
  Bell,
  MessageCircle,
  Palette,
  ChevronDown
} from 'lucide-react-native';
import { Habit } from '@/types/habit';

interface HabitFormProps {
  habit?: Habit;
  onSave: (habitData: Omit<Habit, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const HABIT_COLORS = [
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
const HABIT_ICONS = [
  '💪', '🏃', '📚', '🧘', '💧', '🥗', '😴', '🎯',
  '✍️', '🎵', '🎨', '🌱', '🏠', '💼', '❤️', '🧠'
];
const FREQUENCY_OPTIONS = [
  { id: 'daily', label: 'Daily', description: 'Every day' },
  { id: 'weekly', label: 'Weekly', description: 'Once per week' },
  { id: 'custom', label: 'Custom', description: 'Choose days and frequency' },
];

export default function HabitForm({ habit, onSave, onCancel, isEditing = false }: HabitFormProps) {
  const [name, setName] = useState(habit?.name || '');
  const [description, setDescription] = useState(habit?.description || '');
  const [type, setType] = useState<'boolean' | 'measurable'>(habit?.type || 'boolean');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>(habit?.frequency || 'daily');
  const [customDays, setCustomDays] = useState<number[]>(habit?.customDays || []);
  const [weeklyTarget, setWeeklyTarget] = useState(habit?.weeklyTarget?.toString() || '3');
  const [reminderTime, setReminderTime] = useState<Date | null>(habit?.reminderTime || null);
  const [motivationalQuestion, setMotivationalQuestion] = useState(habit?.motivationalQuestion || '');
  const [selectedColor, setSelectedColor] = useState(habit?.color || HABIT_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(habit?.icon || HABIT_ICONS[0]);
  const [targetValue, setTargetValue] = useState(habit?.targetValue?.toString() || '');
  const [unit, setUnit] = useState(habit?.unit || '');
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    if (frequency === 'custom' && customDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day for custom frequency');
      return;
    }

    if (frequency === 'custom') {
      const target = parseInt(weeklyTarget);
      if (!weeklyTarget || isNaN(target) || target <= 0 || target > customDays.length) {
        Alert.alert('Error', `Weekly target must be between 1 and ${customDays.length} (selected days)`);
        return;
      }
    }
    if (type === 'measurable') {
      const target = parseFloat(targetValue);
      if (!targetValue || isNaN(target) || target <= 0) {
        Alert.alert('Error', 'Please enter a valid target value');
        return;
      }
      if (!unit.trim()) {
        Alert.alert('Error', 'Please enter a unit of measurement');
        return;
      }
    }

    const habitData: Omit<Habit, 'id' | 'createdAt'> = {
      name: name.trim(),
      description: description.trim() || undefined,
      type,
      frequency,
      customDays: frequency === 'custom' ? customDays : undefined,
      weeklyTarget: frequency === 'custom' ? parseInt(weeklyTarget) : undefined,
      reminderTime: reminderTime || undefined,
      motivationalQuestion: motivationalQuestion.trim() || undefined,
      color: selectedColor,
      icon: selectedIcon,
      targetValue: type === 'measurable' ? parseFloat(targetValue) : undefined,
      unit: type === 'measurable' ? unit.trim() : undefined,
      isActive: true,
    };

    onSave(habitData);
  };

  const toggleDay = (dayValue: number) => {
    if (customDays.includes(dayValue)) {
      setCustomDays(customDays.filter(day => day !== dayValue));
    } else {
      setCustomDays([...customDays, dayValue].sort());
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const DAYS = [
    { label: 'Sun', value: 0 },
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Habit' : 'Create New Habit'}
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
        {/* Habit Name */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Habit Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="What habit do you want to build?"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
            autoFocus
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Why is this habit important to you? (optional)"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Tracking Type */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Tracking Type *</Text>
          <Text style={styles.helpText}>How do you want to track this habit?</Text>

          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeOption,
                type === 'boolean' && styles.selectedTypeOption
              ]}
              onPress={() => setType('boolean')}
              activeOpacity={0.7}
            >
              <CheckSquare
                size={20}
                color={type === 'boolean' ? '#6366F1' : '#6B7280'}
                strokeWidth={2}
              />
              <View style={styles.typeContent}>
                <Text style={[
                  styles.typeTitle,
                  type === 'boolean' && styles.selectedTypeTitle
                ]}>
                  Yes/No Habit
                </Text>
                <Text style={styles.typeDescription}>
                  Simple completion tracking (e.g., "Did I exercise?")
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeOption,
                type === 'measurable' && styles.selectedTypeOption
              ]}
              onPress={() => setType('measurable')}
              activeOpacity={0.7}
            >
              <Target
                size={20}
                color={type === 'measurable' ? '#6366F1' : '#6B7280'}
                strokeWidth={2}
              />
              <View style={styles.typeContent}>
                <Text style={[
                  styles.typeTitle,
                  type === 'measurable' && styles.selectedTypeTitle
                ]}>
                  Measurable Habit
                </Text>
                <Text style={styles.typeDescription}>
                  Track with numbers (e.g., "How many minutes did I meditate?")
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Measurable Habit Fields */}
        {type === 'measurable' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Target Value *</Text>
              <TextInput
                style={styles.input}
                placeholder="How much do you want to achieve daily?"
                placeholderTextColor="#9CA3AF"
                value={targetValue}
                onChangeText={setTargetValue}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Unit *</Text>
              <TextInput
                style={styles.input}
                placeholder="minutes, steps, pages, etc."
                placeholderTextColor="#9CA3AF"
                value={unit}
                onChangeText={setUnit}
              />
            </View>
          </>
        )}

        {/* Frequency */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Frequency *</Text>
          <Text style={styles.helpText}>How often do you want to do this habit?</Text>

          <View style={styles.frequencyContainer}>
            {FREQUENCY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.frequencyOption,
                  frequency === option.id && styles.selectedFrequencyOption
                ]}
                onPress={() => setFrequency(option.id as any)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.frequencyLabel,
                  frequency === option.id && styles.selectedFrequencyLabel
                ]}>
                  {option.label}
                </Text>
                <Text style={styles.frequencyDescription}>
                  {option.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {frequency === 'custom' && (
            <View style={styles.dayPickerContainer}>
              <Text style={styles.dayPickerLabel}>Select Days</Text>
              <Text style={styles.dayPickerHelp}>Choose which days this habit can be completed</Text>
              <View style={styles.daysContainer}>
                {DAYS.map((day) => {
                  const isSelected = customDays.includes(day.value);
                  return (
                    <TouchableOpacity
                      key={day.value}
                      style={[
                        styles.dayButton,
                        isSelected && styles.selectedDayButton
                      ]}
                      onPress={() => toggleDay(day.value)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.dayText,
                        isSelected && styles.selectedDayText
                      ]}>
                        {day.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {customDays.length === 0 && (
                <Text style={styles.errorText}>Please select at least one day</Text>
              )}
              
              {/* Weekly Target */}
              {customDays.length > 0 && (
                <View style={styles.weeklyTargetContainer}>
                  <Text style={styles.weeklyTargetLabel}>Weekly Target *</Text>
                  <Text style={styles.weeklyTargetHelp}>
                    How many times per week do you want to complete this habit?
                  </Text>
                  <View style={styles.weeklyTargetInputContainer}>
                    <TextInput
                      style={styles.weeklyTargetInput}
                      value={weeklyTarget}
                      onChangeText={setWeeklyTarget}
                      keyboardType="numeric"
                      placeholder="3"
                      placeholderTextColor="#9CA3AF"
                    />
                    <Text style={styles.weeklyTargetSuffix}>
                      times per week (max {customDays.length})
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Reminder Time */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Reminder Time</Text>
          <Text style={styles.helpText}>Get notified when it's time to complete your habit</Text>

          {reminderTime ? (
            <View style={styles.reminderContainer}>
              <View style={styles.reminderDisplay}>
                <Bell size={16} color="#6366F1" strokeWidth={2} />
                <Text style={styles.reminderText}>{formatTime(reminderTime)}</Text>
              </View>
              <TouchableOpacity
                style={styles.reminderAction}
                onPress={() => setReminderTime(null)}
                activeOpacity={0.7}
              >
                <X size={14} color="#EF4444" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.reminderButton}
              onPress={() => setShowTimePicker(true)}
              activeOpacity={0.7}
            >
              <Clock size={16} color="#6B7280" strokeWidth={2} />
              <Text style={styles.reminderButtonText}>Set reminder time</Text>
              <ChevronDown size={16} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>

        {/* Motivational Question */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Motivational Question</Text>
          <Text style={styles.helpText}>A personal question or note to motivate you</Text>
          <View style={styles.motivationInputContainer}>
            <MessageCircle size={16} color="#6B7280" strokeWidth={2} />
            <TextInput
              style={styles.motivationInput}
              placeholder="Why is this habit important to you?"
              placeholderTextColor="#9CA3AF"
              value={motivationalQuestion}
              onChangeText={setMotivationalQuestion}
              multiline
            />
          </View>
        </View>

        {/* Color Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Color</Text>
          <View style={styles.colorContainer}>
            {HABIT_COLORS.map((color) => (
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

        {/* Icon Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Icon</Text>
          <View style={styles.iconContainer}>
            {HABIT_ICONS.map((icon) => (
              <TouchableOpacity
                key={icon}
                style={[
                  styles.iconOption,
                  selectedIcon === icon && styles.selectedIconOption
                ]}
                onPress={() => setSelectedIcon(icon)}
                activeOpacity={0.7}
              >
                <Text style={styles.iconText}>{icon}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons - Fixed at bottom */}
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
            {isEditing ? 'Update Habit' : 'Create Habit'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Time Picker Modal */}
      <SimpleTimePickerModal
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        onTimeSelect={(time) => {
          setReminderTime(time);
          setShowTimePicker(false);
        }}
        currentTime={reminderTime}
      />
    </SafeAreaView>
  );
}

// Simple Time Picker Modal Component
function SimpleTimePickerModal({
  visible,
  onClose,
  onTimeSelect,
  currentTime
}: {
  visible: boolean;
  onClose: () => void;
  onTimeSelect: (time: Date) => void;
  currentTime: Date | null;
}) {
  const now = new Date();
  const [selectedHour, setSelectedHour] = useState(currentTime ? currentTime.getHours() : 9);
  const [selectedMinute, setSelectedMinute] = useState(currentTime ? Math.round(currentTime.getMinutes() / 15) * 15 : 0);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  const handleConfirm = () => {
    const selectedTime = new Date();
    selectedTime.setHours(selectedHour, selectedMinute, 0, 0);
    onTimeSelect(selectedTime);
  };

  const getDisplayTime = () => {
    const time = new Date();
    time.setHours(selectedHour, selectedMinute, 0, 0);
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
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
        <View style={styles.timePickerContainer}>
          <View style={styles.timePickerHeader}>
            <Text style={styles.timePickerTitle}>Set Reminder Time</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <X size={20} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.timeSelectorsContainer}>
            <View style={styles.timeColumn}>
              <Text style={styles.timeColumnLabel}>Hour</Text>
              <ScrollView style={styles.timeScrollView} showsVerticalScrollIndicator={false}>
                {hours.map((hour) => {
                  const isSelected = selectedHour === hour;
                  return (
                    <TouchableOpacity
                      key={hour}
                      style={[styles.timeOption, isSelected && styles.selectedTimeOption]}
                      onPress={() => setSelectedHour(hour)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.timeOptionText,
                        isSelected && styles.selectedTimeOptionText
                      ]}>
                        {hour.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.timeColumn}>
              <Text style={styles.timeColumnLabel}>Minute</Text>
              <ScrollView style={styles.timeScrollView} showsVerticalScrollIndicator={false}>
                {minutes.map((minute) => {
                  const isSelected = selectedMinute === minute;
                  return (
                    <TouchableOpacity
                      key={minute}
                      style={[styles.timeOption, isSelected && styles.selectedTimeOption]}
                      onPress={() => setSelectedMinute(minute)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.timeOptionText,
                        isSelected && styles.selectedTimeOptionText
                      ]}>
                        {minute.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          <View style={styles.selectedTimeDisplay}>
            <Clock size={16} color="#6366F1" strokeWidth={2} />
            <Text style={styles.selectedTimeText}>
              {getDisplayTime()}
            </Text>
          </View>

          <View style={styles.timePickerActions}>
            <TouchableOpacity
              style={styles.timePickerCancelButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.timePickerCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.timePickerConfirmButton}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.timePickerConfirmText}>Set Time</Text>
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
  frequencyContainer: {
    gap: 8,
  },
  frequencyOption: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
  },
  selectedFrequencyOption: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  frequencyLabel: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 2,
  },
  selectedFrequencyLabel: {
    color: '#6366F1',
  },
  frequencyDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  dayPickerContainer: {
    marginTop: 16,
  },
  dayPickerLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  dayPickerHelp: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 12,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  dayButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedDayButton: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  dayText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#EF4444',
    marginTop: 4,
  },
  weeklyTargetContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  weeklyTargetLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 4,
  },
  weeklyTargetHelp: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 12,
  },
  weeklyTargetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weeklyTargetInput: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: 80,
    textAlign: 'center',
  },
  weeklyTargetSuffix: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    flex: 1,
  },
  reminderContainer: {
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
  reminderDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reminderText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginLeft: 8,
  },
  reminderAction: {
    padding: 4,
  },
  reminderButton: {
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
  reminderButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },
  motivationInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  motivationInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginLeft: 8,
    minHeight: 40,
    textAlignVertical: 'top',
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
  iconContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedIconOption: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  iconText: {
    fontSize: 20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  timePickerContainer: {
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
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  timePickerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  timeSelectorsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    maxHeight: 200,
  },
  timeColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  timeColumnLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeScrollView: {
    maxHeight: 150,
    width: '100%',
  },
  timeOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    alignItems: 'center',
    minHeight: 36,
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  selectedTimeOption: {
    backgroundColor: '#6366F1',
  },
  timeOptionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  selectedTimeOptionText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  selectedTimeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  selectedTimeText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  timePickerActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  timePickerCancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  timePickerCancelText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  timePickerConfirmButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  timePickerConfirmText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});