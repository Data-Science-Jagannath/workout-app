import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, TextInput, Modal, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useWorkoutContext, WorkoutTemplate, WorkoutExercise } from '@/context/WorkoutContext';
import { useAuth } from '@/context/AuthContext';

// ─── Exercise Database ──────────────────────────────
const EXERCISE_DATABASE = [
  { id: '1', name: 'Bench Press', muscle: 'Chest', type: 'Barbell' },
  { id: '2', name: 'Deadlift', muscle: 'Back/Legs', type: 'Barbell' },
  { id: '3', name: 'Squat', muscle: 'Legs', type: 'Barbell' },
  { id: '4', name: 'Pull-up', muscle: 'Back', type: 'Bodyweight' },
  { id: '5', name: 'Dumbbell Curl', muscle: 'Arms', type: 'Dumbbell' },
  { id: '6', name: 'Overhead Press', muscle: 'Shoulders', type: 'Barbell' },
  { id: '7', name: 'Leg Press', muscle: 'Legs', type: 'Machine' },
  { id: '8', name: 'Incline Dumbbell Press', muscle: 'Chest', type: 'Dumbbell' },
  { id: '9', name: 'Tricep Pushdown', muscle: 'Arms', type: 'Cable' },
  { id: '10', name: 'Lat Pulldown', muscle: 'Back', type: 'Cable' },
  { id: '11', name: 'Lunges', muscle: 'Legs', type: 'Bodyweight' },
  { id: '12', name: 'Lateral Raises', muscle: 'Shoulders', type: 'Dumbbell' },
  { id: '13', name: 'Plank', muscle: 'Core', type: 'Bodyweight' },
  { id: '14', name: 'Burpees', muscle: 'Full Body', type: 'Bodyweight' },
  { id: '15', name: 'Mountain Climbers', muscle: 'Core/Cardio', type: 'Bodyweight' },
  { id: '16', name: 'Jump Rope', muscle: 'Cardio', type: 'Equipment' },
  { id: '17', name: 'Box Jumps', muscle: 'Legs/Cardio', type: 'Equipment' },
  { id: '18', name: 'Rowing Machine', muscle: 'Full Body', type: 'Machine' },
];

// ─── Workout Templates ──────────────────────────────
const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'p1', title: 'Push Day', subtitle: 'Chest, Shoulders & Triceps',
    icon: 'flame', color: '#FF6B00', estimatedMinutes: 45, restSeconds: 90,
    exercises: [
      { name: 'Bench Press', defaultSets: 4, defaultReps: '8' },
      { name: 'Overhead Press', defaultSets: 3, defaultReps: '10' },
      { name: 'Incline Dumbbell Press', defaultSets: 3, defaultReps: '12' },
      { name: 'Lateral Raises', defaultSets: 3, defaultReps: '15' },
      { name: 'Tricep Pushdown', defaultSets: 3, defaultReps: '12' },
    ],
  },
  {
    id: 'p2', title: 'Pull Day', subtitle: 'Back, Biceps & Rear Delts',
    icon: 'water', color: '#00F0FF', estimatedMinutes: 45, restSeconds: 90,
    exercises: [
      { name: 'Deadlift', defaultSets: 4, defaultReps: '5' },
      { name: 'Pull-up', defaultSets: 3, defaultReps: '8' },
      { name: 'Lat Pulldown', defaultSets: 3, defaultReps: '12' },
      { name: 'Dumbbell Curl', defaultSets: 3, defaultReps: '12' },
    ],
  },
  {
    id: 'p3', title: 'Leg Day', subtitle: 'Quads, Hamstrings & Calves',
    icon: 'flash', color: '#B514FF', estimatedMinutes: 50, restSeconds: 120,
    exercises: [
      { name: 'Squat', defaultSets: 4, defaultReps: '8' },
      { name: 'Leg Press', defaultSets: 3, defaultReps: '12' },
      { name: 'Lunges', defaultSets: 3, defaultReps: '10' },
    ],
  },
  {
    id: 'p4', title: 'Full Body', subtitle: 'Compound Heavy Lifts',
    icon: 'earth', color: '#39FF14', estimatedMinutes: 60, restSeconds: 120,
    exercises: [
      { name: 'Squat', defaultSets: 4, defaultReps: '6' },
      { name: 'Bench Press', defaultSets: 4, defaultReps: '6' },
      { name: 'Deadlift', defaultSets: 3, defaultReps: '5' },
      { name: 'Pull-up', defaultSets: 3, defaultReps: '8' },
      { name: 'Overhead Press', defaultSets: 3, defaultReps: '8' },
    ],
  },
  {
    id: 'p5', title: 'Upper Body', subtitle: 'Chest, Back, Arms & Shoulders',
    icon: 'body', color: '#FF0055', estimatedMinutes: 40, restSeconds: 60,
    exercises: [
      { name: 'Bench Press', defaultSets: 3, defaultReps: '10' },
      { name: 'Lat Pulldown', defaultSets: 3, defaultReps: '10' },
      { name: 'Overhead Press', defaultSets: 3, defaultReps: '10' },
      { name: 'Dumbbell Curl', defaultSets: 3, defaultReps: '12' },
      { name: 'Tricep Pushdown', defaultSets: 3, defaultReps: '12' },
    ],
  },
  {
    id: 'p6', title: 'HIIT Circuit', subtitle: 'High Intensity Intervals',
    icon: 'pulse', color: '#FFE600', estimatedMinutes: 25, restSeconds: 30,
    exercises: [
      { name: 'Burpees', defaultSets: 4, defaultReps: '10' },
      { name: 'Mountain Climbers', defaultSets: 4, defaultReps: '20' },
      { name: 'Box Jumps', defaultSets: 4, defaultReps: '12' },
      { name: 'Plank', defaultSets: 3, defaultReps: '45s' },
    ],
  },
  {
    id: 'p7', title: 'Cardio Burn', subtitle: 'Endurance & Fat Loss',
    icon: 'heart', color: '#FF6BCC', estimatedMinutes: 30, restSeconds: 15,
    exercises: [
      { name: 'Jump Rope', defaultSets: 5, defaultReps: '60s' },
      { name: 'Rowing Machine', defaultSets: 3, defaultReps: '500m' },
      { name: 'Burpees', defaultSets: 3, defaultReps: '15' },
      { name: 'Mountain Climbers', defaultSets: 3, defaultReps: '30' },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────
const generateId = () => Math.random().toString(36).substr(2, 9);
const formatTime = (totalSec: number) => {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// ═════════════════════════════════════════════════════
export default function TemplatesScreen() {
  const router = useRouter();
  const {
    activeWorkout, startWorkout, startCustomWorkout, startTimer,
    finishActiveWorkout, cancelActiveWorkout,
    updateActiveExercises, updateSessionName, addExerciseToActive,
    elapsedSeconds,
  } = useWorkoutContext();
  const { units } = useAuth();

  const [isExerciseModal, setIsExerciseModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Rest timer
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const restRef = useRef<any>(null);

  // ── Rest timer logic ──
  const startRestTimer = (seconds: number) => {
    setRestTimeLeft(seconds);
    setIsResting(true);
  };

  useEffect(() => {
    if (isResting && restTimeLeft > 0) {
      restRef.current = setTimeout(() => setRestTimeLeft(restTimeLeft - 1), 1000);
    } else if (isResting && restTimeLeft <= 0) {
      setIsResting(false);
      Vibration.vibrate(500);
    }
    return () => { if (restRef.current) clearTimeout(restRef.current); };
  }, [isResting, restTimeLeft]);

  const skipRest = () => { setIsResting(false); setRestTimeLeft(0); };

  // ── Exercise mutations through context ──
  const exercises = activeWorkout.exercises;

  const removeExercise = (exerciseId: string) => {
    updateActiveExercises(exercises.filter(ex => ex.id !== exerciseId));
  };

  const addSet = (exerciseId: string) => {
    updateActiveExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        const lastSet = ex.sets[ex.sets.length - 1];
        return {
          ...ex, sets: [...ex.sets, {
            id: generateId(),
            weight: lastSet ? lastSet.weight : '',
            reps: lastSet ? lastSet.reps : '',
            completed: false,
          }],
        };
      }
      return ex;
    }));
  };

  const removeSet = (exerciseId: string, setId: string) => {
    updateActiveExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return { ...ex, sets: ex.sets.filter(s => s.id !== setId) };
      }
      return ex;
    }));
  };

  const updateSet = (exerciseId: string, setId: string, field: 'weight' | 'reps', value: string) => {
    updateActiveExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return { ...ex, sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s) };
      }
      return ex;
    }));
  };

  const toggleSetCompletion = (exerciseId: string, setId: string) => {
    updateActiveExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(s => {
            if (s.id === setId) {
              const now = !s.completed;
              if (now && activeWorkout.template?.restSeconds) {
                startRestTimer(activeWorkout.template.restSeconds);
              }
              return { ...s, completed: now };
            }
            return s;
          }),
        };
      }
      return ex;
    }));
  };

  const handleFinish = () => {
    finishActiveWorkout();
    router.push('/(tabs)/history');
  };

  const handleAddExercise = (name: string) => {
    addExerciseToActive(name);
    setIsExerciseModal(false);
    setSearchQuery('');
  };

  // ── Progress calculations ──
  const getProgress = () => {
    let completed = 0, total = 0;
    exercises.forEach(ex => ex.sets.forEach(s => { total++; if (s.completed) completed++; }));
    return { completed, total, percent: total > 0 ? completed / total : 0 };
  };
  const progress = getProgress();

  const filteredExercises = EXERCISE_DATABASE.filter(ex =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.muscle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ═══════════════════════════════════════════════════
  // TEMPLATE SELECTION VIEW
  // ═══════════════════════════════════════════════════
  if (!activeWorkout.isActive) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Workout Templates</Text>
          <Text style={styles.headerSub}>Choose a routine or build your own</Text>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Custom Workout Card */}
          <TouchableOpacity activeOpacity={0.8} onPress={startCustomWorkout}>
            <LinearGradient colors={['#1E1F24', '#2A2B30']} style={styles.customCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View style={styles.customCardIcon}>
                <Ionicons name="add-circle" size={32} color="#00F0FF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.customCardTitle}>Custom Workout</Text>
                <Text style={styles.customCardSub}>Build your own from scratch</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#555" />
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.sectionLabel}>PRESET ROUTINES</Text>

          {WORKOUT_TEMPLATES.map(template => (
            <TouchableOpacity
              key={template.id}
              style={styles.templateCard}
              activeOpacity={0.8}
              onPress={() => startWorkout(template)}
            >
              <View style={[styles.templateIcon, { backgroundColor: `${template.color}15` }]}>
                <Ionicons name={template.icon as any} size={28} color={template.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.templateTitle}>{template.title}</Text>
                <Text style={styles.templateSubtitle}>{template.subtitle}</Text>
                <View style={styles.templateMeta}>
                  <View style={styles.metaChip}>
                    <Ionicons name="barbell-outline" size={12} color="#888" />
                    <Text style={styles.metaText}>{template.exercises.length} exercises</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Ionicons name="time-outline" size={12} color="#888" />
                    <Text style={styles.metaText}>~{template.estimatedMinutes}m</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Ionicons name="pause-outline" size={12} color="#888" />
                    <Text style={styles.metaText}>{template.restSeconds}s rest</Text>
                  </View>
                </View>
              </View>
              <Ionicons name="play-circle" size={36} color={template.color} />
            </TouchableOpacity>
          ))}

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ═══════════════════════════════════════════════════
  // ACTIVE WORKOUT VIEW
  // ═══════════════════════════════════════════════════
  return (
    <SafeAreaView style={styles.container}>
      {/* Active Header */}
      <View style={styles.activeHeader}>
        <View style={{ flex: 1 }}>
          <TextInput
            style={styles.activeTitle}
            value={activeWorkout.sessionName}
            onChangeText={updateSessionName}
            placeholder="Workout Name"
            placeholderTextColor="#555"
          />
          <Text style={styles.activeSubtitle}>
            {exercises.length} exercises • {progress.completed}/{progress.total} sets done
          </Text>
        </View>
        <View style={[styles.timerPill, !activeWorkout.timerStarted && styles.timerPillSetup]}>
          <Ionicons name="time" size={14} color={activeWorkout.timerStarted ? '#39FF14' : '#888'} />
          <Text style={[styles.timerPillText, !activeWorkout.timerStarted && styles.timerPillTextSetup]}>
            {activeWorkout.timerStarted ? formatTime(elapsedSeconds) : 'SETUP'}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${progress.percent * 100}%` }]} />
      </View>

      {/* START WORKOUT Button - shown before timer starts */}
      {!activeWorkout.timerStarted && (
        <TouchableOpacity style={styles.startBannerBtn} onPress={startTimer} activeOpacity={0.8}>
          <LinearGradient colors={['#39FF14', '#00CC10']} style={styles.startBannerGrad} start={{x:0,y:0}} end={{x:1,y:0}}>
            <Ionicons name="play" size={22} color="#000" />
            <Text style={styles.startBannerText}>START WORKOUT</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Rest Timer Overlay */}
      {isResting && (
        <View style={styles.restBanner}>
          <View style={styles.restContent}>
            <Ionicons name="pause-circle" size={24} color="#00F0FF" />
            <Text style={styles.restText}>Rest: {restTimeLeft}s</Text>
          </View>
          <TouchableOpacity onPress={skipRest}>
            <Text style={styles.skipText}>Skip →</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {exercises.length === 0 ? (
          <View style={styles.emptyActive}>
            <Ionicons name="barbell-outline" size={48} color="#333" />
            <Text style={styles.emptyActiveTitle}>No exercises yet</Text>
            <Text style={styles.emptyActiveText}>Add exercises to start your session</Text>
          </View>
        ) : (
          exercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exCardHeader}>
                <View style={styles.exIndexBadge}>
                  <Text style={styles.exIndexText}>{index + 1}</Text>
                </View>
                <Text style={styles.exName} numberOfLines={1}>{exercise.name}</Text>
                <TouchableOpacity onPress={() => removeExercise(exercise.id)} style={{ padding: 4 }}>
                  <Ionicons name="trash-outline" size={18} color="#FF0055" />
                </TouchableOpacity>
              </View>

              {/* Set Table */}
              <View style={styles.setTableHeader}>
                <Text style={[styles.setHeaderCol, { flex: 0.4 }]}>SET</Text>
                <Text style={[styles.setHeaderCol, { flex: 1 }]}>{units.weight.toUpperCase()}</Text>
                <Text style={[styles.setHeaderCol, { flex: 1 }]}>REPS</Text>
                <Text style={[styles.setHeaderCol, { flex: 0.4, textAlign: 'center' }]}>✓</Text>
                <View style={{ width: 28 }} />
              </View>

              {exercise.sets.map((set, si) => (
                <View key={set.id} style={[styles.setRow, set.completed && styles.setRowDone]}>
                  <Text style={[styles.setNum, { flex: 0.4 }, set.completed && { color: '#39FF14' }]}>{si + 1}</Text>
                  <View style={[styles.setInput, { flex: 1 }]}>
                    <TextInput
                      style={styles.setInputText}
                      value={set.weight}
                      onChangeText={v => updateSet(exercise.id, set.id, 'weight', v)}
                      keyboardType="numeric"
                      placeholder="-"
                      placeholderTextColor="#444"
                    />
                  </View>
                  <View style={[styles.setInput, { flex: 1 }]}>
                    <TextInput
                      style={styles.setInputText}
                      value={set.reps}
                      onChangeText={v => updateSet(exercise.id, set.id, 'reps', v)}
                      keyboardType="numeric"
                      placeholder="-"
                      placeholderTextColor="#444"
                    />
                  </View>
                  <TouchableOpacity style={{ flex: 0.4, alignItems: 'center' }} onPress={() => toggleSetCompletion(exercise.id, set.id)}>
                    <Ionicons
                      name={set.completed ? "checkmark-circle" : "checkmark-circle-outline"}
                      size={28}
                      color={set.completed ? "#39FF14" : "#444"}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity style={{ width: 28, alignItems: 'center' }} onPress={() => removeSet(exercise.id, set.id)}>
                    <Ionicons name="close" size={18} color="#FF0055" />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity style={styles.addSetBtn} onPress={() => addSet(exercise.id)}>
                <Ionicons name="add" size={16} color="#00F0FF" />
                <Text style={styles.addSetBtnText}>Add Set</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Add Exercise Button */}
        <TouchableOpacity style={styles.addExBtn} onPress={() => setIsExerciseModal(true)}>
          <Ionicons name="add-circle" size={22} color="#00F0FF" />
          <Text style={styles.addExBtnText}>Add Exercise</Text>
        </TouchableOpacity>

        {/* Action Buttons */}
        {exercises.length > 0 && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={cancelActiveWorkout}>
              <Text style={styles.cancelBtnText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 2 }} onPress={handleFinish}>
              <LinearGradient colors={['#39FF14', '#00CC10']} style={styles.finishBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="checkmark-done" size={20} color="#000" />
                <Text style={styles.finishBtnText}>FINISH WORKOUT</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Exercise Selection Modal */}
      <Modal visible={isExerciseModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHead}>
              <Text style={styles.modalHeadTitle}>Add Exercise</Text>
              <TouchableOpacity onPress={() => setIsExerciseModal(false)}>
                <Ionicons name="close" size={28} color="#FFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalSearch}>
              <Ionicons name="search" size={18} color="#888" />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search exercises..."
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredExercises.map(item => (
                <TouchableOpacity key={item.id} style={styles.modalExRow} onPress={() => handleAddExercise(item.name)}>
                  <View style={styles.modalExIcon}>
                    <Ionicons name="barbell" size={20} color="#00F0FF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalExName}>{item.name}</Text>
                    <Text style={styles.modalExDetail}>{item.muscle} • {item.type}</Text>
                  </View>
                  <Ionicons name="add-circle-outline" size={24} color="#39FF14" />
                </TouchableOpacity>
              ))}
              {filteredExercises.length === 0 && searchQuery.length > 0 && (
                <View style={{ alignItems: 'center', marginTop: 40 }}>
                  <Text style={{ color: '#888' }}>No results for "{searchQuery}"</Text>
                  <TouchableOpacity style={{ marginTop: 16, padding: 12, backgroundColor: '#1E1F24', borderRadius: 8 }} onPress={() => handleAddExercise(searchQuery)}>
                    <Text style={{ color: '#39FF14' }}>Add Custom: "{searchQuery}"</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1014' },

  // Template Selection
  header: { padding: 20, paddingTop: Platform.OS === 'android' ? 44 : 20 },
  headerTitle: { color: '#FFF', fontSize: 28, fontWeight: '800' },
  headerSub: { color: '#888', fontSize: 14, marginTop: 4 },
  scrollContent: { padding: 20, paddingTop: 0 },
  sectionLabel: { color: '#555', fontSize: 12, fontWeight: '700', letterSpacing: 2, marginTop: 24, marginBottom: 14 },

  customCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,240,255,0.2)', borderStyle: 'dashed' },
  customCardIcon: { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(0,240,255,0.08)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  customCardTitle: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  customCardSub: { color: '#888', fontSize: 13, marginTop: 3 },

  templateCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1B20', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  templateIcon: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  templateTitle: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  templateSubtitle: { color: '#888', fontSize: 13, marginTop: 2 },
  templateMeta: { flexDirection: 'row', marginTop: 8, gap: 10 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: '#666', fontSize: 11 },

  // Active Workout
  activeHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'android' ? 44 : 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  activeTitle: { color: '#FFF', fontSize: 22, fontWeight: '800', padding: 0 },
  activeSubtitle: { color: '#888', fontSize: 13, marginTop: 4 },
  timerPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(57,255,20,0.1)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(57,255,20,0.25)' },
  timerPillText: { color: '#39FF14', fontWeight: '700', fontSize: 16, fontVariant: ['tabular-nums'] },

  progressBarContainer: { height: 3, backgroundColor: '#1E1F24' },
  progressBarFill: { height: 3, backgroundColor: '#39FF14', borderRadius: 2 },

  restBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(0,240,255,0.08)', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,240,255,0.15)' },
  restContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  restText: { color: '#00F0FF', fontWeight: '700', fontSize: 16, fontVariant: ['tabular-nums'] },
  skipText: { color: '#888', fontWeight: '600' },

  emptyActive: { alignItems: 'center', paddingVertical: 50 },
  emptyActiveTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginTop: 12 },
  emptyActiveText: { color: '#666', marginTop: 6 },

  exerciseCard: { backgroundColor: '#1A1B20', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  exCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  exIndexBadge: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(0,240,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  exIndexText: { color: '#00F0FF', fontWeight: '800', fontSize: 13 },
  exName: { flex: 1, color: '#FFF', fontSize: 18, fontWeight: '700' },

  setTableHeader: { flexDirection: 'row', paddingHorizontal: 4, marginBottom: 8 },
  setHeaderCol: { color: '#555', fontWeight: '700', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
  setRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 10, paddingVertical: 6, paddingHorizontal: 4 },
  setRowDone: { backgroundColor: 'rgba(57,255,20,0.05)', borderWidth: 1, borderColor: 'rgba(57,255,20,0.15)' },
  setNum: { color: '#888', fontWeight: '700', fontSize: 14, textAlign: 'center' },
  setInput: { backgroundColor: 'rgba(255,255,255,0.04)', marginHorizontal: 3, borderRadius: 6, height: 36, justifyContent: 'center' },
  setInputText: { color: '#FFF', fontSize: 16, fontWeight: '600', textAlign: 'center', flex: 1 },

  addSetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, paddingVertical: 10, gap: 6, backgroundColor: 'rgba(0,240,255,0.04)', borderRadius: 10 },
  addSetBtnText: { color: '#00F0FF', fontWeight: '600', fontSize: 13 },

  addExBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14, backgroundColor: '#1A1B20', borderWidth: 1, borderColor: 'rgba(0,240,255,0.2)', borderStyle: 'dashed', gap: 8, marginBottom: 16 },
  addExBtnText: { color: '#00F0FF', fontWeight: '700', fontSize: 15 },

  actionRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: { flex: 1, backgroundColor: '#1A1B20', paddingVertical: 16, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cancelBtnText: { color: '#888', fontWeight: '800', fontSize: 14, letterSpacing: 1 },
  finishBtn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  finishBtnText: { color: '#000', fontWeight: '800', fontSize: 14, letterSpacing: 1 },

  timerPillSetup: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' },
  timerPillTextSetup: { color: '#888' },

  startBannerBtn: { marginBottom: 16, borderRadius: 12, overflow: 'hidden', shadowColor: '#39FF14', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  startBannerGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 10 },
  startBannerText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#121215', height: '80%', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalHeadTitle: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  modalSearch: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1F24', paddingHorizontal: 14, height: 46, borderRadius: 12, marginBottom: 16, gap: 10 },
  modalSearchInput: { flex: 1, color: '#FFF', fontSize: 15 },
  modalExRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  modalExIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(0,240,255,0.08)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  modalExName: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  modalExDetail: { color: '#888', fontSize: 12, marginTop: 3 },
});
