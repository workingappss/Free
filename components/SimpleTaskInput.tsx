import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Check, X } from 'lucide-react-native';
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
    const trimmedTitle = taskTitle.trim();
    if (!trimmedTitle) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    onSave(trimmedTitle);
    setTaskTitle('');
  };

  const handleCancel = () => {
    setTaskTitle('');
    onCancel();
  };

  const canSave = taskTitle.trim().length > 0;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Add Task</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            What would you like to accomplish?
          </Text>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: colors.card, 
                borderColor: colors.borderLight, 
                color: colors.text 
              }
            ]}
            placeholder={placeholder}
            placeholderTextColor={colors.textTertiary}
            value={taskTitle}
            onChangeText={setTaskTitle}
            autoFocus
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            returnKeyType="done"
            onSubmitEditing={canSave ? handleSave : undefined}
            blurOnSubmit={false}
          />
          
          {/* Character count */}
          <Text style={[styles.characterCount, { color: colors.textTertiary }]}>
            {taskTitle.length} characters
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.cancelButton, 
              { backgroundColor: colors.card, borderColor: colors.borderLight }
            ]}
            onPress={handleCancel}
            activeOpacity={0.7}
          >
            <X size={16} color={colors.textSecondary} strokeWidth={2} />
            <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton, 
              { 
                backgroundColor: canSave ? colors.primary : colors.card,
                borderColor: canSave ? colors.primary : colors.borderLight,
                opacity: canSave ? 1 : 0.5
              }
            ]}
            onPress={handleSave}
            activeOpacity={canSave ? 0.8 : 1}
            disabled={!canSave}
          >
            <Check 
              size={16} 
              color={canSave ? '#FFFFFF' : colors.textTertiary} 
              strokeWidth={2} 
            />
            <Text style={[
              styles.saveButtonText, 
              { color: canSave ? '#FFFFFF' : colors.textTertiary }
            ]}>
              Add Task
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Tips */}
        <View style={[styles.tips, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.tipsText, { color: colors.primary }]}>
            💡 Tip: Keep it simple and actionable
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    lineHeight: 22,
  },
  inputSection: {
    marginBottom: 24,
  },
  input: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    lineHeight: 24,
  },
  characterCount: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textAlign: 'right',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  tips: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tipsText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
});