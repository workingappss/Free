import React from 'react';
import { Modal } from 'react-native';
import { router } from 'expo-router';
import { Habit } from '@/types/habit';
import { habitStorage } from '@/utils/habitStorage';
import HabitForm from '@/components/HabitForm';

export default function CreateHabitScreen() {
  const handleSave = async (habitData: Omit<Habit, 'id' | 'createdAt'>) => {
    try {
      const newHabit: Habit = {
        ...habitData,
        id: Date.now().toString(),
        createdAt: new Date(),
      };

      await habitStorage.saveHabit(newHabit);
      router.back();
    } catch (error) {
      console.error('Error creating habit:', error);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleCancel}
    >
      <HabitForm
        onSave={handleSave}
        onCancel={handleCancel}
        isEditing={false}
      />
    </Modal>
  );
}