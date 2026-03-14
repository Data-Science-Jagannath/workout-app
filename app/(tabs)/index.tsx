import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar, Modal, Image, TextInput, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useWorkoutContext } from '@/context/WorkoutContext';
import { useAuth } from '@/context/AuthContext';

// Simple exercise list for spotlight
const SPOTLIGHT_EXERCISES = [
  { name: 'Barbell Back Squat', muscle: 'Legs', equipment: 'Barbell' },
  { name: 'Romanian Deadlift', muscle: 'Hamstrings & Glutes', equipment: 'Barbell' },
  { name: 'Incline Dumbbell Press', muscle: 'Upper Chest', equipment: 'Dumbbells' },
  { name: 'Pull-up', muscle: 'Back & Lats', equipment: 'Bodyweight' },
  { name: 'Overhead Press', muscle: 'Shoulders', equipment: 'Barbell' },
];

export default function DashboardScreen() {
  const router = useRouter();
  const { history, activeWorkout, elapsedSeconds } = useWorkoutContext();
  const { user, units } = useAuth();
  
  const [spotlight, setSpotlight] = useState(SPOTLIGHT_EXERCISES[0]);
  
  // Progress Tracking State
  const [isProgressModalVisible, setProgressModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'analytics' | 'photos'>('analytics');
  const [photos, setPhotos] = useState<string[]>([]);
  const [currentWeight, setCurrentWeight] = useState('185.0');
  const [bodyFat, setBodyFat] = useState('14.2');

  // Rotate spotlight every time dashboard mounts (for mockup variety)
  useEffect(() => {
    const randomEx = SPOTLIGHT_EXERCISES[Math.floor(Math.random() * SPOTLIGHT_EXERCISES.length)];
    setSpotlight(randomEx);
  }, []);

  // Calculate stats from history
  const totalWorkouts = history.length;
  const lastWorkout = totalWorkouts > 0 ? history[0] : null;

  let totalVolume = 0;
  history.forEach(workout => {
    const volNum = parseInt(workout.volume.replace(/\D/g, ''));
    if (!isNaN(volNum)) {
      totalVolume += volNum;
    }
  });

  const displayVolume = totalVolume > 1000 
    ? `${(totalVolume / 1000).toFixed(1)}k` 
    : totalVolume.toString();

  // Highlight logic for active routine widget
  const activeRoutineName = lastWorkout ? lastWorkout.title : "Start a New Session";
  const activeExercisesCount = lastWorkout ? lastWorkout.exercises.length : 0;
  const activeDuration = lastWorkout ? lastWorkout.duration : "0 min";

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 1,
    });

    if (!result.canceled) {
      setPhotos([result.assets[0].uri, ...photos]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS === 'android' && <StatusBar backgroundColor="#0F1014" barStyle="light-content" />}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'Athlete'}</Text>
          </View>
          <TouchableOpacity style={styles.avatarContainer} onPress={() => router.push('/profile')}>
            {user?.photoUri ? (
              <Image source={{uri: user.photoUri}} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={24} color="#39FF14" />
            )}
          </TouchableOpacity>
        </View>

        {/* Active Workout Banner */}
        {activeWorkout.isActive && (
          <TouchableOpacity 
            style={styles.activeBanner}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/templates')}
          >
            <LinearGradient colors={['rgba(57,255,20,0.15)', 'rgba(0,240,255,0.08)']} style={styles.activeBannerGrad} start={{x:0,y:0}} end={{x:1,y:0}}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                <View style={styles.activeDot} />
                <View>
                  <Text style={styles.activeBannerTitle}>{activeWorkout.sessionName}</Text>
                  <Text style={styles.activeBannerSub}>
                    {activeWorkout.timerStarted 
                      ? `${activeWorkout.exercises.length} exercises • ${Math.floor(elapsedSeconds/60)}:${(elapsedSeconds%60).toString().padStart(2,'0')}`
                      : `${activeWorkout.exercises.length} exercises • Setting up session...`
                    }
                  </Text>
                </View>
              </View>
              <Text style={styles.activeBannerAction}>
                {activeWorkout.timerStarted ? 'Continue →' : 'Tap to Start →'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Progress Tracker Widget */}
        <TouchableOpacity style={styles.widgetContainer} activeOpacity={0.8} onPress={() => setProgressModalVisible(true)}>
          <LinearGradient colors={['#1E1F24', '#17181C']} style={styles.widgetGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.widgetHeader}>
              <View style={styles.widgetIconAreaPurple}>
                <Ionicons name="stats-chart" size={20} color="#B514FF" />
              </View>
              <Text style={styles.widgetTitle}>Personal Progress</Text>
            </View>
            
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5}}>
              <View>
                <Text style={styles.heavyText}>{currentWeight} <Text style={{fontSize: 16, color: '#888'}}>{units.weight}</Text></Text>
                <Text style={styles.lightText}>Current Weight</Text>
              </View>
              <View style={{alignItems: 'flex-end'}}>
                <Text style={styles.widgetSubtitle}>1RM Tracker</Text>
                <View style={{flexDirection: 'row', gap: 6, marginTop: 4}}>
                  <View style={[styles.miniBar, {height: 24, backgroundColor: '#39FF14'}]} />
                  <View style={[styles.miniBar, {height: 36, backgroundColor: '#00F0FF'}]} />
                  <View style={[styles.miniBar, {height: 16, backgroundColor: '#FF0055'}]} />
                </View>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Tracker Widget -> Navigates to Templates */}
        <TouchableOpacity style={styles.widgetContainer} activeOpacity={0.8} onPress={() => router.push('/(tabs)/templates')}>
          <LinearGradient colors={['#1E1F24', '#17181C']} style={styles.widgetGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.widgetHeader}>
              <View style={styles.widgetIconArea}>
                <Ionicons name="fitness" size={24} color="#39FF14" />
              </View>
              <Text style={styles.widgetTitle}>{lastWorkout ? 'Last Routine' : 'Ready to Lift?'}</Text>
            </View>
            <Text style={styles.widgetSubtitle}>{activeRoutineName}</Text>
            <View style={styles.trackerStats}>
              <View style={styles.statChip}>
                <Ionicons name="time-outline" size={14} color="#888" />
                <Text style={styles.statText}>{activeDuration}</Text>
              </View>
              <View style={styles.statChip}>
                <Ionicons name="barbell-outline" size={14} color="#888" />
                <Text style={styles.statText}>{activeExercisesCount} Exercises</Text>
              </View>
            </View>
            <LinearGradient colors={['#39FF14', '#00F0FF']} style={styles.buttonGradient} start={{x:0, y:0}} end={{x:1, y:0}}>
              <Text style={styles.buttonText}>START WORKOUT</Text>
            </LinearGradient>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.row}>
          {/* History Widget -> Navigates to History */}
          <TouchableOpacity 
            style={[styles.widgetContainer, styles.halfWidget]} 
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/history')}
          >
            <LinearGradient colors={['#1E1F24', '#17181C']} style={styles.widgetGradient}>
              <View style={styles.widgetIconAreaBlue}>
                <Ionicons name="bar-chart" size={20} color="#00F0FF" />
              </View>
              <Text style={[styles.widgetTitle, {marginTop: 12}]}>Total Sessions</Text>
              <Text style={styles.heavyText}>{totalWorkouts}</Text>
              <Text style={styles.lightText}>{displayVolume} lbs Lifted</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Timer Widget -> Navigates to Timer */}
          <TouchableOpacity 
            style={[styles.widgetContainer, styles.halfWidget]} 
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/timer')}
          >
            <LinearGradient colors={['#1E1F24', '#17181C']} style={styles.widgetGradient}>
              <View style={styles.widgetIconAreaOrange}>
                <Ionicons name="timer" size={20} color="#FF6B00" />
              </View>
              <Text style={[styles.widgetTitle, {marginTop: 12}]}>Quick Rest</Text>
              <Text style={styles.heavyText}>01:30</Text>
              <Text style={styles.lightText}>Recent Timer</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Library Widget -> Navigates to Library */}
        <TouchableOpacity 
          style={styles.widgetContainer} 
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/library')}
        >
          <LinearGradient colors={['#1E1F24', '#17181C']} style={[styles.widgetGradient, {paddingVertical: 24}]}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <View style={{flex: 1, paddingRight: 10}}>
                <Text style={styles.widgetTitle}>Exercise Spotlight</Text>
                <Text style={[styles.widgetSubtitle, {fontSize: 18, marginTop: 6, marginBottom: 4}]}>{spotlight.name}</Text>
                <Text style={styles.lightText}>{spotlight.muscle} • {spotlight.equipment}</Text>
              </View>
              <View style={styles.widgetIconAreaPurple}>
                <Ionicons name="library" size={24} color="#B514FF" />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{height: 100}} /> 
      </ScrollView>

      {/* Advanced Personal Progress Modal */}
      <Modal visible={isProgressModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContent}>
            
            <View style={styles.modalDragIndicator} />
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Progression</Text>
              <TouchableOpacity onPress={() => setProgressModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close-circle" size={32} color="#444" />
              </TouchableOpacity>
            </View>

            {/* Sub-Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tabButton, activeTab === 'analytics' && styles.activeTabButton]} 
                onPress={() => setActiveTab('analytics')}
              >
                <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>Analytics & Body</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tabButton, activeTab === 'photos' && styles.activeTabButton]} 
                onPress={() => setActiveTab('photos')}
              >
                <Text style={[styles.tabText, activeTab === 'photos' && styles.activeTabText]}>Progress Photos</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 40}}>
              {activeTab === 'analytics' ? (
                <>
                  {/* Body Metrics */}
                  <Text style={styles.sectionHeader}>Body Tracking</Text>
                  <View style={styles.metricsRow}>
                    <View style={styles.metricInputCard}>
                      <Text style={styles.metricLabel}>Weight ({units.weight})</Text>
                      <TextInput
                        style={styles.metricInput}
                        keyboardType="decimal-pad"
                        value={currentWeight}
                        onChangeText={setCurrentWeight}
                      />
                    </View>
                    <View style={styles.metricInputCard}>
                      <Text style={styles.metricLabel}>Body Fat (%)</Text>
                      <TextInput
                        style={styles.metricInput}
                        keyboardType="decimal-pad"
                        value={bodyFat}
                        onChangeText={setBodyFat}
                      />
                    </View>
                  </View>

                  {/* Volume Chart Mockup */}
                  <View style={{marginTop: 30, marginBottom: 10}}>
                    <Text style={styles.sectionHeader}>Weekly Volume (Total Lbs)</Text>
                  </View>
                  <View style={styles.chartContainer}>
                    <View style={styles.chartBars}>
                      {[30, 45, 60, 40, 80, 55, 90].map((height, i) => (
                        <View key={i} style={styles.barCol}>
                          <LinearGradient 
                            colors={['#00F0FF', 'rgba(0, 240, 255, 0)']} 
                            style={[styles.chartBar, {height: `${height}%`}]} 
                          />
                        </View>
                      ))}
                    </View>
                    <View style={styles.chartLabels}>
                      {['M','T','W','T','F','S','S'].map((day, i) => (
                        <Text key={i} style={styles.chartDay}>{day}</Text>
                      ))}
                    </View>
                  </View>

                  {/* 1RM Estimates */}
                  <View style={{marginTop: 30, marginBottom: 10}}>
                    <Text style={styles.sectionHeader}>1RM Estimates</Text>
                  </View>
                  
                  <View style={styles.ormCard}>
                    <View style={styles.ormRow}>
                      <Text style={styles.ormLift}>Bench Press</Text>
                      <Text style={styles.ormWeight}>245 {units.weight}</Text>
                    </View>
                    <View style={styles.progressBarBg}><View style={[styles.progressBarFill, {width: '60%', backgroundColor: '#39FF14'}]} /></View>
                  </View>
                  
                  <View style={styles.ormCard}>
                    <View style={styles.ormRow}>
                      <Text style={styles.ormLift}>Squat</Text>
                      <Text style={styles.ormWeight}>315 {units.weight}</Text>
                    </View>
                    <View style={styles.progressBarBg}><View style={[styles.progressBarFill, {width: '80%', backgroundColor: '#B514FF'}]} /></View>
                  </View>
                  
                  <View style={styles.ormCard}>
                    <View style={styles.ormRow}>
                      <Text style={styles.ormLift}>Deadlift</Text>
                      <Text style={styles.ormWeight}>405 {units.weight}</Text>
                    </View>
                    <View style={styles.progressBarBg}><View style={[styles.progressBarFill, {width: '90%', backgroundColor: '#FF6B00'}]} /></View>
                  </View>

                </>
              ) : (
                <>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
                    <Text style={styles.sectionHeader}>Physique Timeline</Text>
                    <TouchableOpacity style={styles.cameraBtn} onPress={pickImage}>
                      <Ionicons name="camera" size={20} color="#FFF" />
                      <Text style={{color: '#FFF', fontWeight:'700', marginLeft: 6}}>Upload Photo</Text>
                    </TouchableOpacity>
                  </View>

                  {photos.length === 0 ? (
                    <View style={styles.emptyPhotos}>
                      <Ionicons name="image-outline" size={64} color="#333" />
                      <Text style={styles.emptyText}>Post photo updates visually tracking your incredible bodily recomp.</Text>
                    </View>
                  ) : (
                    <View style={styles.photoGrid}>
                      {photos.map((uri, idx) => (
                        <View key={idx} style={styles.photoWrapper}>
                          <Image source={{ uri }} style={styles.gridImage} />
                          <Text style={styles.photoDate}>Today</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1014', // Ultra dark
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  greeting: {
    color: '#888',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  userName: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1E1F24',
    borderWidth: 2,
    borderColor: '#39FF14',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  activeBanner: { marginBottom: 16, borderRadius: 16, overflow: 'hidden' },
  activeBannerGrad: { padding: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(57,255,20,0.2)' },
  activeDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#39FF14' },
  activeBannerTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  activeBannerSub: { color: '#888', fontSize: 12, marginTop: 2 },
  activeBannerAction: { color: '#39FF14', fontWeight: '700' },
  widgetContainer: {
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  widgetGradient: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  halfWidget: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  widgetIconArea: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  widgetIconAreaBlue: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  widgetIconAreaOrange: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  widgetIconAreaPurple: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(181, 20, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  widgetTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  widgetSubtitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  trackerStats: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
  },
  statText: {
    color: '#AAA',
    fontSize: 12,
    fontWeight: '500',
  },
  buttonGradient: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 1,
  },
  heavyText: {
    color: '#FFF',
    fontSize: 34,
    fontWeight: '900',
    marginTop: 8,
  },
  lightText: {
    color: '#888',
    fontSize: 13,
    marginTop: 4,
  },
  miniBar: {
    width: 8,
    borderRadius: 4,
  },
  // Modal Overlays
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#15161A',
    height: '90%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  modalDragIndicator: {
    width: 40,
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '800',
  },
  closeButton: {
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E1F24',
    padding: 6,
    borderRadius: 16,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTabButton: {
    backgroundColor: '#2A2C33',
  },
  tabText: {
    color: '#888',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: '#FFF',
    fontWeight: '800',
  },
  sectionHeader: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  metricInputCard: {
    flex: 1,
    backgroundColor: '#1E1F24',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  metricLabel: {
    color: '#888',
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 8,
  },
  metricInput: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 4,
  },
  chartContainer: {
    height: 200,
    backgroundColor: '#1E1F24',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  chartBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  barCol: {
    width: 24,
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: '100%',
    borderRadius: 6,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  chartDay: {
    color: '#666',
    fontSize: 12,
    fontWeight: '700',
  },
  ormCard: {
    backgroundColor: '#1E1F24',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  ormRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ormLift: {
    color: '#CCC',
    fontSize: 16,
    fontWeight: '600',
  },
  ormWeight: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
  },
  cameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.4)',
  },
  emptyPhotos: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoWrapper: {
    width: '48%',
    aspectRatio: 3/4,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1E1F24',
    borderWidth: 1,
    borderColor: '#333',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  photoDate: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 10,
    fontWeight: '700',
  }
});
