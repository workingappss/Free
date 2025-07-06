import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Check, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface SimpleTaskFormProps {
  onSave: (title: string) => void;
  onCancel: () => void;
}

export default function SimpleTaskForm({ onSave, onCancel }: SimpleTaskFormProps) {
  const [title, setTitle] = useState('');
  const { colors } = useTheme();

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    onSave(trimmedTitle);
  };

  const canSave = title.trim().length > 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>What needs to be done?</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Keep it simple and actionable
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
            placeholder="Enter your task..."
            placeholderTextColor={colors.textTertiary}
            value={title}
            onChangeText={setTitle}
            autoFocus
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            returnKeyType="done"
            onSubmitEditing={canSave ? handleSave : undefined}
            blurOnSubmit={false}
            maxLength={200}
          />
          
          {/* Character count */}
          <View style={styles.inputFooter}>
            <Text style={[styles.characterCount, { color: colors.textTertiary }]}>
              {title.length}/200 characters
            </Text>
          </View>
        </View>

        {/* Tips */}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.cancelButton, 
            { backgroundColor: colors.card, borderColor: colors.borderLight }
          ]}
          onPress={onCancel}
          activeOpacity={0.7}
        >
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
          <Text style={[
            styles.saveButtonText, 
            { color: canSave ? '#FFFFFF' : colors.textTertiary }
          ]}>
            Create Task
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
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
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  characterCount: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 16,
    borderRadius: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  saveButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
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
});