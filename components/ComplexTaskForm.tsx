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
  Modal,
  SafeAreaView,
} from 'react-native';
import { Plus, X, Clock, Trash2, ChevronDown, Target } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import GoalSelector from './GoalSelector';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface ComplexTaskFormProps {
  onSave: (taskData: {
    title: string;
    description: string;
    subtasks: Subtask[];
    startTime: Date | null;
    duration: number;
    linkedGoalId?: string;
    goalContribution?: number;
    goalUnit?: string;
  }) => void;
  onCancel: () => void;
}

export default function ComplexTaskForm({ onSave, onCancel }: ComplexTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [linkedGoalId, setLinkedGoalId] = useState<string | undefined>();
  const [goalContribution, setGoalContribution] = useState<number | undefined>();
  const [goalUnit, setGoalUnit] = useState<string | undefined>();
  const { colors } = useTheme();

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) {
      Alert.alert('Error', 'Please enter a subtask title');
      return;
    }

    const newSubtask: Subtask = {
      id: Date.now().toString(),
      title: newSubtaskTitle.trim(),
      completed: false,
    };

    setSubtasks(prev => [...prev, newSubtask]);
    setNewSubtaskTitle('');
  };

  const removeSubtask = (subtaskId: string) => {
    setSubtasks(prev => prev.filter(subtask => subtask.id !== subtaskId));
  };

  const handleTimeSelection = (selectedTime: Date) => {
    setStartTime(selectedTime);
    setShowTimePicker(false);
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return 'Select start time';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    const durationMinutes = duration ? parseInt(duration, 10) : 0;
    if (duration && (isNaN(durationMinutes) || durationMinutes <= 0)) {
      Alert.alert('Error', 'Please enter a valid duration in minutes');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      subtasks,
      startTime,
      duration: durationMinutes,
      linkedGoalId,
      goalContribution,
      goalUnit,
    });
  };

  const handleGoalSelect = (goalId: string | undefined, contribution: number | undefined, unit: string | undefined) => {
    setLinkedGoalId(goalId);
    setGoalContribution(contribution);
    setGoalUnit(unit);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Create Complex Task</Text>
        <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.card }]} onPress={onCancel} activeOpacity={0.7}>
          <X size={20} color={colors.textSecondary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Task Title */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Task Title *</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Enter task title"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
        </View>

        {/* Task Description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Add task description (optional)"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Start Time */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Start Time</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowTimePicker(true)}
            activeOpacity={0.7}
          >
            <Clock size={16} color="#6B7280" strokeWidth={2} />
            <Text style={[styles.timeButtonText, !startTime && styles.placeholderText]}>
              {formatDateTime(startTime)}
            </Text>
            <ChevronDown size={16} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Duration */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Duration (minutes)</Text>
          <View style={styles.durationContainer}>
            <Clock size={16} color="#6B7280" strokeWidth={2} />
            <TextInput
              style={styles.durationInput}
              placeholder="30"
              placeholderTextColor="#9CA3AF"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
            />
            <Text style={styles.durationUnit}>min</Text>
          </View>
        </View>

        {/* Goal Linking */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Link to Goal</Text>
          <Text style={styles.helpText}>Connect this task to a goal to automatically update progress when completed</Text>
          <GoalSelector
            selectedGoalId={linkedGoalId}
            goalContribution={goalContribution}
            goalUnit={goalUnit}
            onGoalSelect={handleGoalSelect}
          />
        </View>

        {/* Subtasks */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Subtasks ({subtasks.length})</Text>
          
          {/* Add Subtask Input */}
          <View style={styles.addSubtaskContainer}>
            <TextInput
              style={styles.subtaskInput}
              placeholder="Add a subtask"
              placeholderTextColor="#9CA3AF"
              value={newSubtaskTitle}
              onChangeText={setNewSubtaskTitle}
              onSubmitEditing={addSubtask}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={styles.addSubtaskButton}
              onPress={addSubtask}
              activeOpacity={0.7}
            >
              <Plus size={16} color="#4F46E5" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Subtasks List */}
          {subtasks.map((subtask) => (
            <View key={subtask.id} style={styles.subtaskItem}>
              <View style={styles.subtaskContent}>
                <View style={styles.subtaskBullet} />
                <Text style={styles.subtaskTitle}>{subtask.title}</Text>
              </View>
              <TouchableOpacity
                style={styles.removeSubtaskButton}
                onPress={() => removeSubtask(subtask.id)}
                activeOpacity={0.7}
              >
                <Trash2 size={14} color="#EF4444" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.cancelActionButton}
          onPress={onCancel}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelActionButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveActionButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveActionButtonText}>Create Task</Text>
        </TouchableOpacity>
      </View>

      {/* Simplified Time Picker Modal */}
      <SimpleTimePickerModal
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        onTimeSelect={handleTimeSelection}
        currentTime={startTime}
      />
    </SafeAreaView>
  );
}

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
  const [selectedHour, setSelectedHour] = useState(currentTime ? currentTime.getHours() : now.getHours());
  const [selectedMinute, setSelectedMinute] = useState(currentTime ? Math.round(currentTime.getMinutes() / 15) * 15 : Math.round(now.getMinutes() / 15) * 15);
  const [is24Hour, setIs24Hour] = useState(false);

  // Generate hours based on 12/24 hour format
  const hours = is24Hour 
    ? Array.from({ length: 24 }, (_, i) => i)
    : Array.from({ length: 12 }, (_, i) => i + 1);

  // Generate minutes in 15-minute intervals for simplicity
  const minutes = [0, 15, 30, 45];

  const formatHour = (hour: number) => {
    if (is24Hour) {
      return hour.toString().padStart(2, '0');
    } else {
      return hour.toString();
    }
  };

  const getCurrentPeriod = () => {
    return selectedHour >= 12 ? 'PM' : 'AM';
  };

  const getDisplayHour = () => {
    if (is24Hour) {
      return selectedHour;
    } else {
      if (selectedHour === 0) return 12;
      if (selectedHour > 12) return selectedHour - 12;
      return selectedHour;
    }
  };

  const togglePeriod = () => {
    if (!is24Hour) {
      setSelectedHour(prev => prev >= 12 ? prev - 12 : prev + 12);
    }
  };

  const handleHourSelect = (hour: number) => {
    if (is24Hour) {
      setSelectedHour(hour);
    } else {
      const currentPeriod = getCurrentPeriod();
      let newHour = hour;
      
      if (currentPeriod === 'PM' && hour !== 12) {
        newHour = hour + 12;
      } else if (currentPeriod === 'AM' && hour === 12) {
        newHour = 0;
      }
      
      setSelectedHour(newHour);
    }
  };

  const handleConfirm = () => {
    const selectedTime = new Date();
    selectedTime.setHours(selectedHour, selectedMinute, 0, 0);
    onTimeSelect(selectedTime);
  };

  const getDisplayTime = () => {
    const time = new Date();
    time.setHours(selectedHour, selectedMinute, 0, 0);
    
    if (is24Hour) {
      return time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } else {
      return time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
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
          {/* Header */}
          <View style={styles.timePickerHeader}>
            <Text style={styles.timePickerTitle}>Select Time</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <X size={20} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Format Toggle */}
          <View style={styles.formatToggleContainer}>
            <TouchableOpacity
              style={[styles.formatButton, !is24Hour && styles.formatButtonActive]}
              onPress={() => setIs24Hour(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.formatButtonText, !is24Hour && styles.formatButtonTextActive]}>
                12 Hour
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.formatButton, is24Hour && styles.formatButtonActive]}
              onPress={() => setIs24Hour(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.formatButtonText, is24Hour && styles.formatButtonTextActive]}>
                24 Hour
              </Text>
            </TouchableOpacity>
          </View>

          {/* Time Selectors */}
          <View style={styles.timeSelectorsContainer}>
            {/* Hours */}
            <View style={styles.timeColumn}>
              <Text style={styles.timeColumnLabel}>Hour</Text>
              <ScrollView style={styles.timeScrollView} showsVerticalScrollIndicator={false}>
                {hours.map((hour) => {
                  const isSelected = is24Hour 
                    ? selectedHour === hour
                    : getDisplayHour() === hour;
                  
                  return (
                    <TouchableOpacity
                      key={hour}
                      style={[styles.timeOption, isSelected && styles.selectedTimeOption]}
                      onPress={() => handleHourSelect(hour)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.timeOptionText,
                        isSelected && styles.selectedTimeOptionText
                      ]}>
                        {formatHour(hour)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Minutes */}
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

            {/* AM/PM Selector (only for 12-hour format) */}
            {!is24Hour && (
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnLabel}>Period</Text>
                <View style={styles.periodContainer}>
                  {['AM', 'PM'].map((period) => {
                    const isSelected = getCurrentPeriod() === period;
                    return (
                      <TouchableOpacity
                        key={period}
                        style={[
                          styles.timeOption,
                          isSelected && styles.selectedTimeOption
                        ]}
                        onPress={togglePeriod}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.timeOptionText,
                          isSelected && styles.selectedTimeOptionText
                        ]}>
                          {period}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          {/* Selected Time Display */}
          <View style={styles.selectedTimeDisplay}>
            <Clock size={16} color="#4F46E5" strokeWidth={2} />
            <Text style={styles.selectedTimeText}>
              {getDisplayTime()}
            </Text>
          </View>

          {/* Action Buttons */}
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
    backgroundColor: '#FFFFFF',
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
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  titleInput: {
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
  descriptionInput: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 80,
  },
  timeButton: {
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
  timeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  durationInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginLeft: 8,
  },
  durationUnit: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  addSubtaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 12,
  },
  subtaskInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    paddingVertical: 4,
  },
  addSubtaskButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 6,
  },
  subtaskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subtaskBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6B7280',
    marginRight: 10,
  },
  subtaskTitle: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    flex: 1,
  },
  removeSubtaskButton: {
    padding: 4,
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
  cancelActionButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelActionButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  saveActionButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveActionButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  // Simplified Time Picker Modal Styles
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
  formatToggleContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  formatButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  formatButtonActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  formatButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  formatButtonTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
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
    backgroundColor: '#4F46E5',
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
  periodContainer: {
    width: '100%',
    paddingVertical: 8,
    alignItems: 'center',
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
    backgroundColor: '#4F46E5',
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