import React, { useState, useEffect } from 'react';
import { Modal } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Habit } from '@/types/habit';
import { habitStorage } from '@/utils/habitStorage';
import { notificationService } from '@/utils/notificationService';
import HabitForm from '@/components/HabitForm';

export default function EditHabitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadHabit();
    }
  }, [id]);

  const loadHabit = async () => {
    try {
      setLoading(true);
      const habits = await habitStorage.getHabits();
      const foundHabit = habits.find(h => h.id === id);
      
      setHabit(foundHabit || null);
    } catch (error) {
      console.error('Error loading habit:', error);
      setHabit(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle navigation after loading completes
  useEffect(() => {
    if (!loading && !habit) {
      router.back();
    }
  }, [loading, habit]);

  const handleSave = async (habitData: Omit<Habit, 'id' | 'createdAt'>) => {
    if (!habit) return;

    try {
      const updatedHabit: Habit = {
        ...habitData,
        id: habit.id,
        createdAt: habit.createdAt,
      };

      await habitStorage.saveHabit(updatedHabit);

      // Update notifications
      await notificationService.cancelHabitReminder(habit.id);
      if (updatedHabit.reminderTime && updatedHabit.isActive) {
        await notificationService.scheduleHabitReminder(updatedHabit);
      }

      router.back();
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return null; // Or a loading spinner
  }

  if (!habit) {
    return null;
  }

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleCancel}
    >
      <HabitForm
        habit={habit}
        onSave={handleSave}
        onCancel={handleCancel}
        isEditing={true}
      />
    </Modal>
  );
}