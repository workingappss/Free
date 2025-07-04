import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { User, Settings, Bell, Shield, CircleHelp as HelpCircle, Star, Award, TrendingUp, ChevronRight, CreditCard as Edit3, LogOut, Moon, Sun, Smartphone, Globe, Lock, Eye, EyeOff, Camera, X, Check, Trash2, Download, Upload, RefreshCw } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { statsCalculator, ProfileStats } from '@/utils/statsCalculator';
import { useFocusEffect } from 'expo-router';

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  memberSince: Date;
  bio: string;
  location: string;
  website: string;
}

interface AppSettings {
  notifications: {
    habits: boolean;
    goals: boolean;
    tasks: boolean;
    reminders: boolean;
    achievements: boolean;
  };
  appearance: {
    theme: ThemeMode;
    language: string;
  };
  privacy: {
    analytics: boolean;
    crashReports: boolean;
    dataSharing: boolean;
  };
  backup: {
    autoBackup: boolean;
    lastBackup: Date | null;
  };
}

export default function ProfileScreen() {
  const { theme, colors, setTheme } = useTheme();
  
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Jiahui Ruan',
    email: 'jr@email.com',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&dpr=2',
    memberSince: new Date('2024-01-15'),
    bio: 'Productivity enthusiast focused on building better habits and achieving meaningful goals.',
    location: 'San Francisco, CA',
    website: 'jr.dev',
  });

  const [settings, setSettings] = useState<AppSettings>({
    notifications: {
      habits: true,
      goals: true,
      tasks: false,
      reminders: true,
      achievements: true,
    },
    appearance: {
      theme,
      language: 'English',
    },
    privacy: {
      analytics: true,
      crashReports: true,
      dataSharing: false,
    },
    backup: {
      autoBackup: true,
      lastBackup: new Date(),
    },
  });

  const [stats, setStats] = useState<ProfileStats>({
    tasksCompleted: 0,
    goalsAchieved: 0,
    streakDays: 0,
    totalHabits: 0,
  });

  const [loading, setLoading] = useState(true);

  const [activeModal, setActiveModal] = useState<'none' | 'profile' | 'notifications' | 'appearance' | 'privacy' | 'backup' | 'help'>('none');
  const [editingProfile, setEditingProfile] = useState<UserProfile>(profile);

  // Load real stats when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    try {
      setLoading(true);
      const realStats = await statsCalculator.calculateProfileStats();
      setStats(realStats);
    } catch (error) {
      console.error('Error loading profile stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMemberSince = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const handleProfileSave = () => {
    setProfile(editingProfile);
    setActiveModal('none');
  };

  const handleSettingChange = (category: keyof AppSettings, setting: string, value: any) => {
    if (category === 'appearance' && setting === 'theme') {
      setTheme(value);
    }
    
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
  };

  const handleBackup = async () => {
    Alert.alert(
      'Create Backup',
      'This will create a backup of all your data including habits, goals, and tasks.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Create Backup', 
          onPress: () => {
            // Simulate backup creation
            setSettings(prev => ({
              ...prev,
              backup: {
                ...prev.backup,
                lastBackup: new Date(),
              },
            }));
            Alert.alert('Success', 'Backup created successfully!');
          }
        },
      ]
    );
  };

  const handleRestore = () => {
    Alert.alert(
      'Restore Data',
      'This will replace all current data with your backup. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Restore', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Data restored successfully!');
          }
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Account', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
          }
        },
      ]
    );
  };

  const closeModal = () => {
    setActiveModal('none');
    setEditingProfile(profile);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerContent}>
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: profile.avatar }}
                style={styles.profileImage}
              />
              <TouchableOpacity 
                style={styles.editButton} 
                activeOpacity={0.8}
                onPress={() => setActiveModal('profile')}
              >
                <Edit3 size={12} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>{profile.name}</Text>
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{profile.email}</Text>
              <Text style={[styles.memberSince, { color: colors.textTertiary }]}>
                Member since {formatMemberSince(profile.memberSince)}
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.primary + '20' }]}>
                <Award size={16} color={colors.primary} strokeWidth={2} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {loading ? '...' : stats.tasksCompleted}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Tasks</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.success + '20' }]}>
                <Star size={16} color={colors.success} strokeWidth={2} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {loading ? '...' : stats.goalsAchieved}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Goals</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.warning + '20' }]}>
                <TrendingUp size={16} color={colors.warning} strokeWidth={2} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {loading ? '...' : stats.streakDays}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Streak</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#8B5CF6' + '20' }]}>
                <TrendingUp size={16} color="#8B5CF6" strokeWidth={2} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {loading ? '...' : stats.totalHabits}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Habits</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Settings Sections */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
            onPress={() => setActiveModal('notifications')}
            activeOpacity={0.8}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.primary + '20' }]}>
              <Bell size={18} color={colors.primary} strokeWidth={2} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>Notifications</Text>
              <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>Manage your alerts and reminders</Text>
            </View>
            <ChevronRight size={18} color={colors.textTertiary} strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
            onPress={() => setActiveModal('appearance')}
            activeOpacity={0.8}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#8B5CF620' }]}>
              <Settings size={18} color="#8B5CF6" strokeWidth={2} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>Appearance</Text>
              <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>Theme, language, and display settings</Text>
            </View>
            <ChevronRight size={18} color={colors.textTertiary} strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
            onPress={() => setActiveModal('privacy')}
            activeOpacity={0.8}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.success + '20' }]}>
              <Shield size={18} color={colors.success} strokeWidth={2} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>Privacy & Security</Text>
              <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>Control your data and privacy settings</Text>
            </View>
            <ChevronRight size={18} color={colors.textTertiary} strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
            onPress={() => setActiveModal('backup')}
            activeOpacity={0.8}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.warning + '20' }]}>
              <Download size={18} color={colors.warning} strokeWidth={2} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>Backup & Restore</Text>
              <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>Manage your data backups</Text>
            </View>
            <ChevronRight size={18} color={colors.textTertiary} strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
            onPress={() => setActiveModal('help')}
            activeOpacity={0.8}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#06B6D420' }]}>
              <HelpCircle size={18} color="#06B6D4" strokeWidth={2} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>Help & Support</Text>
              <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>Get help and contact support</Text>
            </View>
            <ChevronRight size={18} color={colors.textTertiary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.surface, borderColor: colors.error + '30' }]} activeOpacity={0.8}>
          <LogOut size={18} color={colors.error} strokeWidth={2} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Sign Out</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={[styles.versionText, { color: colors.textTertiary }]}>DoFive v1.0.0</Text>
      </ScrollView>

      {/* Profile Edit Modal */}
      <Modal
        visible={activeModal === 'profile'}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={closeModal} activeOpacity={0.7}>
              <X size={20} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.profileEditSection}>
              <View style={styles.avatarEditContainer}>
                <Image
                  source={{ uri: editingProfile.avatar }}
                  style={styles.avatarEditImage}
                />
                <TouchableOpacity style={styles.avatarEditButton} activeOpacity={0.8}>
                  <Camera size={16} color="#6366F1" strokeWidth={2} />
                </TouchableOpacity>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={editingProfile.name}
                  onChangeText={(text) => setEditingProfile(prev => ({ ...prev, name: text }))}
                  placeholder="Enter your name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Email</Text>
                <TextInput
                  style={styles.formInput}
                  value={editingProfile.email}
                  onChangeText={(text) => setEditingProfile(prev => ({ ...prev, email: text }))}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Bio</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  value={editingProfile.bio}
                  onChangeText={(text) => setEditingProfile(prev => ({ ...prev, bio: text }))}
                  placeholder="Tell us about yourself"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Location</Text>
                <TextInput
                  style={styles.formInput}
                  value={editingProfile.location}
                  onChangeText={(text) => setEditingProfile(prev => ({ ...prev, location: text }))}
                  placeholder="Where are you located?"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Website</Text>
                <TextInput
                  style={styles.formInput}
                  value={editingProfile.website}
                  onChangeText={(text) => setEditingProfile(prev => ({ ...prev, website: text }))}
                  placeholder="Your website or portfolio"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="url"
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={closeModal}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleProfileSave}
              activeOpacity={0.8}
            >
              <Text style={styles.modalSaveText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Notifications Settings Modal */}
      <Modal
        visible={activeModal === 'notifications'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notification Settings</Text>
            <TouchableOpacity onPress={closeModal} activeOpacity={0.7}>
              <X size={20} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>App Notifications</Text>
              
              {Object.entries(settings.notifications).map(([key, value]) => (
                <View key={key} style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Text>
                    <Text style={styles.settingDescription}>
                      Get notified about {key.toLowerCase()}
                    </Text>
                  </View>
                  <Switch
                    value={value}
                    onValueChange={(newValue) => handleSettingChange('notifications', key, newValue)}
                    trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
                    thumbColor={value ? '#FFFFFF' : '#F3F4F6'}
                  />
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Appearance Settings Modal */}
      <Modal
        visible={activeModal === 'appearance'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.borderLight }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Appearance Settings</Text>
            <TouchableOpacity onPress={closeModal} activeOpacity={0.7}>
              <X size={20} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.settingsSection}>
              <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>Theme</Text>
              
              <View style={styles.themeGrid}>
                {[
                  { id: 'light', name: 'Light', color: '#F59E0B', icon: 'sun' },
                  { id: 'dark', name: 'Dark', color: '#6366F1', icon: 'moon' },
                  { id: 'pink', name: 'Pink', color: '#EC4899', icon: 'color' },
                  { id: 'blue', name: 'Blue', color: '#0EA5E9', icon: 'color' },
                  { id: 'green', name: 'Green', color: '#16A34A', icon: 'color' },
                  { id: 'orange', name: 'Orange', color: '#F59E0B', icon: 'color' },
                  { id: 'purple', name: 'Purple', color: '#A855F7', icon: 'color' },
                  { id: 'red', name: 'Red', color: '#EF4444', icon: 'color' },
                  { id: 'system', name: 'System', color: '#10B981', icon: 'system' },
                ].map((themeOption) => (
                  <TouchableOpacity
                    key={themeOption.id}
                    style={[
                      styles.themeCard,
                      { backgroundColor: colors.background, borderColor: colors.borderLight },
                      settings.appearance.theme === themeOption.id && {
                        borderColor: colors.primary,
                        backgroundColor: colors.primaryLight
                      }
                    ]}
                    onPress={() => handleSettingChange('appearance', 'theme', themeOption.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.themeCardContent}>
                      <View style={[styles.themeCardIcon, { backgroundColor: themeOption.color + '20' }]}>
                        {themeOption.icon === 'sun' && (
                          <Sun size={16} color={themeOption.color} strokeWidth={2} />
                        )}
                        {themeOption.icon === 'moon' && (
                          <Moon size={16} color={themeOption.color} strokeWidth={2} />
                        )}
                        {themeOption.icon === 'system' && (
                          <Smartphone size={16} color={themeOption.color} strokeWidth={2} />
                        )}
                        {themeOption.icon === 'color' && (
                          <View style={{
                            width: 16,
                            height: 16,
                            borderRadius: 8,
                            backgroundColor: themeOption.color,
                          }} />
                        )}
                      </View>
                      <Text style={[styles.themeCardTitle, { color: colors.text }]}>
                        {themeOption.name}
                      </Text>
                      {settings.appearance.theme === themeOption.id && (
                        <View style={styles.themeCardCheck}>
                          <Check size={12} color={colors.primary} strokeWidth={2} />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.settingsSection}>
              <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>Language</Text>
              
              {['English', 'Spanish', 'French', 'German'].map((language) => (
                <TouchableOpacity
                  key={language}
                  style={[styles.languageOption, { backgroundColor: colors.background, borderColor: colors.borderLight }]}
                  onPress={() => handleSettingChange('appearance', 'language', language)}
                  activeOpacity={0.7}
                >
                  <View style={styles.languageInfo}>
                    <Globe size={16} color={colors.textSecondary} strokeWidth={2} />
                    <Text style={[styles.languageTitle, { color: colors.text }]}>{language}</Text>
                  </View>
                  {settings.appearance.language === language && (
                    <Check size={16} color={colors.primary} strokeWidth={2} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Privacy Settings Modal */}
      <Modal
        visible={activeModal === 'privacy'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Privacy & Security</Text>
            <TouchableOpacity onPress={closeModal} activeOpacity={0.7}>
              <X size={20} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>Data & Analytics</Text>
              
              {Object.entries(settings.privacy).map(([key, value]) => (
                <View key={key} style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Text>
                    <Text style={styles.settingDescription}>
                      {key === 'analytics' && 'Help improve the app with usage data'}
                      {key === 'crashReports' && 'Send crash reports to help fix bugs'}
                      {key === 'dataSharing' && 'Share anonymized data with partners'}
                    </Text>
                  </View>
                  <Switch
                    value={value}
                    onValueChange={(newValue) => handleSettingChange('privacy', key, newValue)}
                    trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
                    thumbColor={value ? '#FFFFFF' : '#F3F4F6'}
                  />
                </View>
              ))}
            </View>

            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>Account Security</Text>
              
              <TouchableOpacity style={styles.securityOption} activeOpacity={0.7}>
                <View style={styles.securityInfo}>
                  <Lock size={16} color="#6B7280" strokeWidth={2} />
                  <Text style={styles.securityTitle}>Change Password</Text>
                </View>
                <ChevronRight size={16} color="#9CA3AF" strokeWidth={2} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.securityOption} activeOpacity={0.7}>
                <View style={styles.securityInfo}>
                  <Eye size={16} color="#6B7280" strokeWidth={2} />
                  <Text style={styles.securityTitle}>Two-Factor Authentication</Text>
                </View>
                <ChevronRight size={16} color="#9CA3AF" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <View style={styles.dangerZone}>
              <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
              <TouchableOpacity 
                style={styles.dangerButton} 
                onPress={handleDeleteAccount}
                activeOpacity={0.7}
              >
                <Trash2 size={16} color="#EF4444" strokeWidth={2} />
                <Text style={styles.dangerButtonText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Backup Settings Modal */}
      <Modal
        visible={activeModal === 'backup'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Backup & Restore</Text>
            <TouchableOpacity onPress={closeModal} activeOpacity={0.7}>
              <X size={20} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>Automatic Backup</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Auto Backup</Text>
                  <Text style={styles.settingDescription}>
                    Automatically backup your data daily
                  </Text>
                </View>
                <Switch
                  value={settings.backup.autoBackup}
                  onValueChange={(value) => handleSettingChange('backup', 'autoBackup', value)}
                  trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
                  thumbColor={settings.backup.autoBackup ? '#FFFFFF' : '#F3F4F6'}
                />
              </View>

              {settings.backup.lastBackup && (
                <View style={styles.backupInfo}>
                  <Text style={styles.backupInfoText}>
                    Last backup: {settings.backup.lastBackup.toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>Manual Backup</Text>
              
              <TouchableOpacity 
                style={styles.backupButton} 
                onPress={handleBackup}
                activeOpacity={0.7}
              >
                <Download size={16} color="#6366F1" strokeWidth={2} />
                <Text style={styles.backupButtonText}>Create Backup</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.restoreButton} 
                onPress={handleRestore}
                activeOpacity={0.7}
              >
                <Upload size={16} color="#10B981" strokeWidth={2} />
                <Text style={styles.restoreButtonText}>Restore from Backup</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Help & Support Modal */}
      <Modal
        visible={activeModal === 'help'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Help & Support</Text>
            <TouchableOpacity onPress={closeModal} activeOpacity={0.7}>
              <X size={20} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.helpSection}>
              <Text style={styles.helpSectionTitle}>Get Help</Text>
              
              <TouchableOpacity style={styles.helpOption} activeOpacity={0.7}>
                <View style={styles.helpInfo}>
                  <HelpCircle size={16} color="#6366F1" strokeWidth={2} />
                  <Text style={styles.helpTitle}>FAQ</Text>
                </View>
                <ChevronRight size={16} color="#9CA3AF" strokeWidth={2} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.helpOption} activeOpacity={0.7}>
                <View style={styles.helpInfo}>
                  <User size={16} color="#10B981" strokeWidth={2} />
                  <Text style={styles.helpTitle}>Contact Support</Text>
                </View>
                <ChevronRight size={16} color="#9CA3AF" strokeWidth={2} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.helpOption} activeOpacity={0.7}>
                <View style={styles.helpInfo}>
                  <Star size={16} color="#F59E0B" strokeWidth={2} />
                  <Text style={styles.helpTitle}>Rate the App</Text>
                </View>
                <ChevronRight size={16} color="#9CA3AF" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <View style={styles.helpSection}>
              <Text style={styles.helpSectionTitle}>About</Text>
              
              <View style={styles.aboutInfo}>
                <Text style={styles.aboutTitle}>DoFive</Text>
                <Text style={styles.aboutVersion}>Version 1.0.0</Text>
                <Text style={styles.aboutDescription}>
                  A comprehensive productivity app designed to help you build better habits, 
                  achieve meaningful goals, and stay organized with your daily tasks.
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContent: {
    padding: 16,
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    justifyContent: 'center',
    minWidth: 180,
    maxWidth: 200,
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  memberSince: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  menuSection: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  versionText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginBottom: 20,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  // Profile Edit Styles
  profileEditSection: {
    paddingVertical: 20,
  },
  avatarEditContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarEditImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#E5E7EB',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  formSection: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
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
  // Settings Styles
  settingsSection: {
    paddingVertical: 20,
  },
  settingsSectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  // Theme Options
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeCard: {
    width: '48%',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 12,
  },
  themeCardContent: {
    alignItems: 'center',
    position: 'relative',
  },
  themeCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  themeCardTitle: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  themeCardCheck: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  themeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeIcon: {
    marginRight: 12,
  },
  themeTitle: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
  },
  // Language Options
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageTitle: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 12,
  },
  // Security Options
  securityOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityTitle: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginLeft: 12,
  },
  // Danger Zone
  dangerZone: {
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
  },
  dangerZoneTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#EF4444',
    marginBottom: 16,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dangerButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
    marginLeft: 8,
  },
  // Backup Styles
  backupInfo: {
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  backupInfoText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#0369A1',
  },
  backupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  backupButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#6366F1',
    marginLeft: 8,
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  restoreButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
    marginLeft: 8,
  },
  // Help Styles
  helpSection: {
    paddingVertical: 20,
  },
  helpSectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  helpOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  helpInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpTitle: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginLeft: 12,
  },
  aboutInfo: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  aboutTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  aboutVersion: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 12,
  },
  aboutDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    lineHeight: 20,
  },
});