import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { X, Target, Plus } from 'lucide-react-native';
import SimpleTaskForm from '@/components/SimpleTaskForm';
import ComplexTaskForm from '@/components/ComplexTaskForm';
import { useTheme } from '@/contexts/ThemeContext';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface TaskCreationModalProps {
  onSave: (taskData: {
    title: string;
    description?: string;
    subtasks?: Subtask[];
    startTime?: Date;
    duration?: number;
    isComplex?: boolean;
  }) => void;
  onCancel: () => void;
}

type TaskType = 'simple' | 'complex';

export default function TaskCreationModal({ onSave, onCancel }: TaskCreationModalProps) {
  const [selectedType, setSelectedType] = useState<TaskType | null>(null);
  const { colors } = useTheme();

  const handleSimpleTaskSave = (title: string) => {
    onSave({
      title,
      isComplex: false,
    });
  };

  const handleComplexTaskSave = (taskData: {
    title: string;
    description: string;
    subtasks: Subtask[];
    startTime: Date | null;
    duration: number;
  }) => {
    onSave({
      title: taskData.title,
      description: taskData.description || undefined,
      subtasks: taskData.subtasks,
      startTime: taskData.startTime || undefined,
      duration: taskData.duration || undefined,
      isComplex: true,
    });
  };

  const handleBack = () => {
    setSelectedType(null);
  };

  // Task Type Selection Screen
  if (!selectedType) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
        <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Create Task</Text>
          <TouchableOpacity 
            style={[styles.closeButton, { backgroundColor: colors.card }]} 
            onPress={onCancel} 
            activeOpacity={0.7}
          >
            <X size={20} color={colors.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.typeSelection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              What type of task would you like to create?
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Choose the option that best fits your needs
            </Text>

            <View style={styles.typeOptions}>
              {/* Simple Task Option */}
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  { backgroundColor: colors.card, borderColor: colors.borderLight }
                ]}
                onPress={() => setSelectedType('simple')}
                activeOpacity={0.8}
              >
                <View style={[styles.typeIconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Plus size={24} color={colors.primary} strokeWidth={2} />
                </View>
                <View style={styles.typeContent}>
                  <Text style={[styles.typeTitle, { color: colors.text }]}>Simple Task</Text>
                  <Text style={[styles.typeDescription, { color: colors.textSecondary }]}>
                    Quick and straightforward task with just a title
                  </Text>
                  <View style={styles.typeFeatures}>
                    <Text style={[styles.typeFeature, { color: colors.textTertiary }]}>• Fast to create</Text>
                    <Text style={[styles.typeFeature, { color: colors.textTertiary }]}>• Perfect for quick todos</Text>
                    <Text style={[styles.typeFeature, { color: colors.textTertiary }]}>• One-click completion</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Complex Task Option */}
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  { backgroundColor: colors.card, borderColor: colors.borderLight }
                ]}
                onPress={() => setSelectedType('complex')}
                activeOpacity={0.8}
              >
                <View style={[styles.typeIconContainer, { backgroundColor: '#8B5CF6' + '20' }]}>
                  <Target size={24} color="#8B5CF6" strokeWidth={2} />
                </View>
                <View style={styles.typeContent}>
                  <Text style={[styles.typeTitle, { color: colors.text }]}>Complex Task</Text>
                  <Text style={[styles.typeDescription, { color: colors.textSecondary }]}>
                    Detailed task with subtasks, timing, and descriptions
                  </Text>
                  <View style={styles.typeFeatures}>
                    <Text style={[styles.typeFeature, { color: colors.textTertiary }]}>• Add subtasks</Text>
                    <Text style={[styles.typeFeature, { color: colors.textTertiary }]}>• Set time & duration</Text>
                    <Text style={[styles.typeFeature, { color: colors.textTertiary }]}>• Detailed descriptions</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Task Form Screen
  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.surface }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: colors.card }]} 
            onPress={handleBack} 
            activeOpacity={0.7}
          >
            <X size={20} color={colors.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {selectedType === 'simple' ? 'Simple Task' : 'Complex Task'}
          </Text>
          <TouchableOpacity 
            style={[styles.closeButton, { backgroundColor: colors.card }]} 
            onPress={onCancel} 
            activeOpacity={0.7}
          >
            <X size={20} color={colors.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          {selectedType === 'simple' ? (
            <SimpleTaskForm
              onSave={handleSimpleTaskSave}
              onCancel={handleBack}
            />
          ) : (
            <ComplexTaskForm
              onSave={handleComplexTaskSave}
              onCancel={handleBack}
            />
          )}
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
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
  typeSelection: {
    paddingVertical: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  typeOptions: {
    gap: 16,
  },
  typeOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  typeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeContent: {
    flex: 1,
  },
  typeTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  typeDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  typeFeatures: {
    gap: 4,
  },
  typeFeature: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    lineHeight: 16,
  },
  formContainer: {
    flex: 1,
  },
});