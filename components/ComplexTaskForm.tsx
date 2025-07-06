import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Plus, X, Clock, Target } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/contexts/ThemeContext';

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
  }) => void;
  onCancel: () => void;
}

export default function ComplexTaskForm({ onSave, onCancel }: ComplexTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState(30);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [customDuration, setCustomDuration] = useState('');
  const { colors } = useTheme();

  const addSubtask = () => {
    if (newSubtaskTitle.trim()) {
      const newSubtask: Subtask = {
        id: Date.now().toString(),
        title: newSubtaskTitle.trim(),
        completed: false,
      };
      setSubtasks([...subtasks, newSubtask]);
      setNewSubtaskTitle('');
    }
  };

  const removeSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.filter(subtask => subtask.id !== subtaskId));
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      subtasks,
      startTime,
      duration,
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const durationOptions = [15, 30, 45, 60, 90, 120, 180, 240];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.surface }]} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Title Input */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Task Title *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.borderLight,
                color: colors.text,
              },
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter task title..."
            placeholderTextColor={colors.textTertiary}
            multiline
            maxLength={100}
          />
        </View>

        {/* Description Input */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Description</Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: colors.card,
                borderColor: colors.borderLight,
                color: colors.text,
              },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add a description..."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
        </View>

        {/* Time Settings */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Time & Duration</Text>
          
          {/* Start Time */}
          <View style={styles.timeRow}>
            <TouchableOpacity
              style={[
                styles.timeButton,
                {
                  backgroundColor: startTime ? colors.primaryLight : colors.card,
                  borderColor: startTime ? colors.primary : colors.borderLight,
                },
              ]}
              onPress={() => setShowTimePicker(true)}
              activeOpacity={0.7}
            >
              <Clock size={16} color={startTime ? colors.primary : colors.textSecondary} strokeWidth={2} />
              <Text
                style={[
                  styles.timeButtonText,
                  { color: startTime ? colors.primary : colors.textSecondary },
                ]}
              >
                {startTime ? formatTime(startTime) : 'Set start time'}
              </Text>
            </TouchableOpacity>

            {startTime && (
              <TouchableOpacity
                style={[styles.clearButton, { backgroundColor: colors.surface }]}
                onPress={() => setStartTime(null)}
                activeOpacity={0.7}
              >
                <X size={14} color={colors.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>

          {/* Duration */}
          <View style={styles.durationContainer}>
            <View style={styles.durationHeader}>
              <Target size={16} color={colors.textSecondary} strokeWidth={2} />
              <Text style={[styles.durationLabel, { color: colors.text }]}>
                Duration: {duration} minutes
              </Text>
            </View>
            <View style={styles.durationOptions}>
              {durationOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.durationOption,
                    {
                      backgroundColor: duration === option ? colors.primary : colors.card,
                      borderColor: duration === option ? colors.primary : colors.borderLight,
                    },
                  ]}
                  onPress={() => setDuration(option)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.durationOptionText,
                      { color: duration === option ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {option}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Custom Duration Input */}
            <View style={styles.customDurationContainer}>
              <Text style={[styles.customDurationLabel, { color: colors.textSecondary }]}>
                Or enter custom duration:
              </Text>
              <View style={styles.customDurationRow}>
                <TextInput
                  style={[
                    styles.customDurationInput,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.borderLight,
                      color: colors.text,
                    },
                  ]}
                  value={customDuration}
                  onChangeText={(text) => {
                    setCustomDuration(text);
                    const minutes = parseInt(text);
                    if (!isNaN(minutes) && minutes > 0) {
                      setDuration(minutes);
                    }
                  }}
                  placeholder="Enter minutes"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                  maxLength={4}
                />
                <Text style={[styles.customDurationUnit, { color: colors.textSecondary }]}>
                  minutes
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Subtasks */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Subtasks</Text>
          
          {/* Add Subtask Input */}
          <View style={styles.addSubtaskContainer}>
            <TextInput
              style={[
                styles.subtaskInput,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.borderLight,
                  color: colors.text,
                },
              ]}
              value={newSubtaskTitle}
              onChangeText={setNewSubtaskTitle}
              placeholder="Add a subtask..."
              placeholderTextColor={colors.textTertiary}
              onSubmitEditing={addSubtask}
              returnKeyType="done"
              maxLength={100}
            />
            <TouchableOpacity
              style={[
                styles.addSubtaskButton,
                {
                  backgroundColor: newSubtaskTitle.trim() ? colors.primary : colors.surface,
                },
              ]}
              onPress={addSubtask}
              disabled={!newSubtaskTitle.trim()}
              activeOpacity={0.7}
            >
              <Plus
                size={16}
                color={newSubtaskTitle.trim() ? '#FFFFFF' : colors.textTertiary}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>

          {/* Subtasks List */}
          {subtasks.length > 0 && (
            <View style={styles.subtasksList}>
              {subtasks.map((subtask, index) => (
                <View
                  key={subtask.id}
                  style={[
                    styles.subtaskItem,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.borderLight,
                    },
                  ]}
                >
                  <Text style={[styles.subtaskNumber, { color: colors.textTertiary }]}>
                    {index + 1}.
                  </Text>
                  <Text style={[styles.subtaskTitle, { color: colors.text }]} numberOfLines={2}>
                    {subtask.title}
                  </Text>
                  <TouchableOpacity
                    style={[styles.removeSubtaskButton, { backgroundColor: colors.surface }]}
                    onPress={() => removeSubtask(subtask.id)}
                    activeOpacity={0.7}
                  >
                    <X size={14} color={colors.error} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: title.trim() ? colors.primary : colors.surface,
              },
            ]}
            onPress={handleSave}
            disabled={!title.trim()}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.saveButtonText,
                { color: title.trim() ? '#FFFFFF' : colors.textTertiary },
              ]}
            >
              Create Task
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Time Picker Modal */}
      {showTimePicker && (
        <DateTimePicker
          value={startTime || new Date()}
          mode="time"
          is24Hour={false}
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) {
              setStartTime(selectedTime);
            }
          }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    minHeight: 50,
    textAlignVertical: 'top',
  },
  textArea: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    flex: 1,
  },
  timeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  clearButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationContainer: {
    gap: 12,
  },
  durationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  durationLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  durationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationOption: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  durationOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  customDurationContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  customDurationLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 8,
  },
  customDurationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customDurationInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    width: 100,
    textAlign: 'center',
  },
  customDurationUnit: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  addSubtaskContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  subtaskInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  addSubtaskButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtasksList: {
    gap: 8,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  subtaskNumber: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#9CA3AF',
    minWidth: 20,
  },
  subtaskTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  removeSubtaskButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});