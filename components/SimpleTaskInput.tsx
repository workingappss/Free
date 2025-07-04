import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface SimpleTaskInputProps {
  onSave: (title: string) => void;
  onCancel: () => void;
  placeholder?: string;
}

export default function SimpleTaskInput({ 
  onSave, 
  onCancel, 
  placeholder = "What needs to be done?" 
}: SimpleTaskInputProps) {
  const [taskTitle, setTaskTitle] = useState('');
  const { colors } = useTheme();

  const handleSave = () => {
    if (!taskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    onSave(taskTitle.trim());
    setTaskTitle(''); // Clear input after saving
  };

  const handleCancel = () => {
    setTaskTitle(''); // Clear input when canceling
    onCancel();
  };

  return (
    <View style={styles.container}>
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
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: colors.card }]}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginBottom: 16,
    paddingVertical: 4,
    minHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
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