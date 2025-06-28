import { Platform } from 'react-native';
import { Habit } from '@/types/habit';

// Only import notifications on native platforms
let Notifications: any = null;
if (Platform.OS !== 'web') {
  try {
    Notifications = require('expo-notifications');
    
    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (error) {
    console.warn('Expo notifications not available:', error);
  }
}

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web' || !Notifications) {
      return false; // Notifications not supported on web
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      return finalStatus === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  },

  async scheduleHabitReminder(habit: Habit): Promise<string | null> {
    if (Platform.OS === 'web' || !habit.reminderTime || !Notifications) {
      return null;
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      // Cancel existing notification for this habit
      await this.cancelHabitReminder(habit.id);

      const trigger = {
        hour: habit.reminderTime.getHours(),
        minute: habit.reminderTime.getMinutes(),
        repeats: true,
      };

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Habit Reminder',
          body: habit.motivationalQuestion || `Time to complete: ${habit.name}`,
          data: { habitId: habit.id },
        },
        trigger,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling habit reminder:', error);
      return null;
    }
  },

  async cancelHabitReminder(habitId: string): Promise<void> {
    if (Platform.OS === 'web' || !Notifications) {
      return;
    }

    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.habitId === habitId) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
    } catch (error) {
      console.error('Error canceling habit reminder:', error);
    }
  },

  async cancelAllHabitReminders(): Promise<void> {
    if (Platform.OS === 'web' || !Notifications) {
      return;
    }

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all habit reminders:', error);
    }
  },
};