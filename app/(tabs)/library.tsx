import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useWorkoutContext } from '@/context/WorkoutContext';
import { useAuth } from '@/context/AuthContext';

// Comprehensive Exercise Database
const EXERCISES = [
  {
    id: '1',
    name: 'Barbell Bench Press',
    muscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Front Deltoids'],
    equipment: 'Barbell, Bench',
    benefits: 'The ultimate mass builder for the chest. It develops upper body pushing strength and heavily stimulates the pectoralis major.',
    instructions: '1. Lie on the bench with eyes under the bar.\n2. Grab the bar slightly wider than shoulder-width.\n3. Lower the bar to your mid-chest.\n4. Press back up powerfully.',
  },
  {
    id: '2',
    name: 'Incline Dumbbell Press',
    muscle: 'Chest',
    secondaryMuscles: ['Front Deltoids', 'Triceps'],
    equipment: 'Dumbbells, Incline Bench',
    benefits: 'Targets the upper or clavicular head of the pectoralis major. Using dumbbells allows for a greater range of motion and fixes strength imbalances.',
    instructions: '1. Set bench to 30-45 degrees.\n2. Kick dumbbells back and press them straight up.\n3. Lower them slowly to the side of your upper chest.\n4. Drive them back up to the top.',
  },
  {
    id: '3',
    name: 'Barbell Back Squat',
    muscle: 'Legs',
    secondaryMuscles: ['Glutes', 'Lower Back', 'Core'],
    equipment: 'Barbell, Squat Rack',
    benefits: 'The undisputed king of all exercises. It drastically improves overall leg mass, central nervous system strength, and core stability.',
    instructions: '1. Rest the barbell firmly on your upper traps.\n2. Step back, feet shoulder width apart.\n3. Break at the hips and knees simultaneously, lowering until thighs are parallel.\n4. Explode back up.',
  },
  {
    id: '4',
    name: 'Romanian Deadlift (RDL)',
    muscle: 'Legs',
    secondaryMuscles: ['Hamstrings', 'Glutes', 'Lower Back'],
    equipment: 'Barbell / Dumbbells',
    benefits: 'Exceptional for developing the posterior chain. It prevents hamstring injuries and builds tremendous glute and lower back strength.',
    instructions: '1. Hold the bar at hip level.\n2. Keep knees slightly bent but largely stiff.\n3. Hinge purely at the hips, pushing your glutes back as far as possible.\n4. Squeeze glutes to return to standing.',
  },
  {
    id: '5',
    name: 'Conventional Deadlift',
    muscle: 'Back',
    secondaryMuscles: ['Hamstrings', 'Glutes', 'Traps', 'Forearms'],
    equipment: 'Barbell, Plates',
    benefits: 'The greatest total body strength builder. It dramatically thickens the back, builds grip strength, and engages nearly every muscle group.',
    instructions: '1. Step to the bar (mid-foot under the bar).\n2. Bend over and grab the bar.\n3. Bend knees until shins touch the bar, lift chest up.\n4. Drag the bar up your legs until you lock out.',
  },
  {
    id: '6',
    name: 'Pull-up',
    muscle: 'Back',
    secondaryMuscles: ['Biceps', 'Lats', 'Core'],
    equipment: 'Pull-up Bar',
    benefits: 'Incredible bodyweight exercise for building a V-taper. It heavily targets the latissimus dorsi and improves relative body strength.',
    instructions: '1. Grab the bar with an overhand grip outside shoulder width.\n2. Retract your scapula and pull your elbows down to the floor.\n3. Pull until your chin passes the bar.\n4. Lower with control.',
  },
  {
    id: '7',
    name: 'Seated Cable Row',
    muscle: 'Back',
    secondaryMuscles: ['Biceps', 'Rear Deltoids', 'Traps'],
    equipment: 'Cable Machine',
    benefits: 'Excellent for adding thickness to the mid-back and rhomboids. Promotes healthy posture by counteracting slouching.',
    instructions: '1. Sit with knees slightly bent and back straight.\n2. Grab the V-bar handle.\n3. Pull the handle directly to your lower stomach, squeezing shoulder blades together.\n4. Slowly release.',
  },
  {
    id: '8',
    name: 'Overhead Barbell Press',
    muscle: 'Shoulders',
    secondaryMuscles: ['Triceps', 'Upper Chest', 'Core'],
    equipment: 'Barbell',
    benefits: 'The primary builder of boulder shoulders. It heavily loads the anterior deltoids and requires immense core stabilization.',
    instructions: '1. Rack the bar across your front deltoids.\n2. Brace your core and glutes.\n3. Press the bar straight overhead, moving your head slightly back to let it pass.\n4. Lockout at the top, then lower.',
  },
  {
    id: '9',
    name: 'Lateral Raise',
    muscle: 'Shoulders',
    secondaryMuscles: ['Traps'],
    equipment: 'Dumbbells / Cables',
    benefits: 'Isolates the lateral (side) head of the deltoid, giving the shoulders a wider, rounder appearance to enhance the V-taper frame.',
    instructions: '1. Hold dumbbells by your sides, slight bend in elbows.\n2. Raise the weights out to the side until arms are parallel with the floor.\n3. Keep pinkies slightly higher than thumbs.\n4. Lower with control.',
  },
  {
    id: '10',
    name: 'Barbell Bicep Curl',
    muscle: 'Arms',
    secondaryMuscles: ['Forearms', 'Core'],
    equipment: 'Barbell / EZ-Bar',
    benefits: 'The staple movement for massive arm development. Allows for maximum loading of the biceps brachii.',
    instructions: '1. Hold the bar with an underhand, shoulder-width grip.\n2. Keep elbows pinned to your sides.\n3. Curl the weight up, squeezing biceps at the top.\n4. Lower fully without swinging your torso.',
  },
  {
    id: '11',
    name: 'Tricep Rope Pushdown',
    muscle: 'Arms',
    secondaryMuscles: ['Shoulders (stabilization)'],
    equipment: 'Cable Machine, Rope Attachment',
    benefits: 'Isolates the triceps, specifically the lateral head. The rope allows for a complete lockout and deep contraction at the bottom.',
    instructions: '1. Attach a rope to the high pulley.\n2. Keep elbows tucked securely against your ribs.\n3. Push the right straight down, pulling the ends apart at the bottom.\n4. Slowly return to just above 90 degrees.',
  },
  {
    id: '12',
    name: 'Hanging Leg Raise',
    muscle: 'Core',
    secondaryMuscles: ['Hip Flexors', 'Forearms'],
    equipment: 'Pull-up Bar',
    benefits: 'Builds functional core strength and heavily taxes the lower abdominals. Incredible for developing a visible 6-pack.',
    instructions: '1. Hang freely from a bar.\n2. Keep legs completely straight (or knees bent to modify).\n3. Contract abdominals to lift your legs up until parallel with the floor (or to the bar).\n4. Lower very slowly to avoid swinging.',
  },
  {
    id: '13',
    name: 'Bulgarian Split Squat',
    muscle: 'Legs',
    secondaryMuscles: ['Glutes', 'Core (Balance)'],
    equipment: 'Dumbbells, Bench',
    benefits: 'An elite unilateral exercise. Fixes leg imbalances, creates insane hypertrophy, and safely unloads the lower spine.',
    instructions: '1. Rest your rear foot on a bench behind you.\n2. Hold dumbbells in each hand.\n3. Drop your rear knee straight down toward the floor.\n4. Push through the heel of your front foot to stand back up.',
  },
];

const CATEGORIES = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

export default function LibraryScreen() {
  const router = useRouter();
  const { activeWorkout, addExerciseToActive } = useWorkoutContext();
  const { units } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  const [selectedExercise, setSelectedExercise] = useState<typeof EXERCISES[0] | null>(null);

  const handleAddToWorkout = () => {
    if (!selectedExercise) return;
    if (!activeWorkout.isActive) {
      Alert.alert('No Active Workout', 'Start a workout from the Templates tab first, then come back here to add exercises.');
      return;
    }
    addExerciseToActive(selectedExercise.name);
    setSelectedExercise(null);
    router.push('/(tabs)/templates');
  };

  // Filter Logic
  const filteredExercises = EXERCISES.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ex.equipment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || ex.muscle === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Library</Text>
          <Text style={styles.subtitle}>{EXERCISES.length} Comprehensive Movements</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search by name or equipment..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Pills */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={[styles.categoryPill, activeCategory === cat && styles.activeCategoryPill]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.categoryText, activeCategory === cat && styles.activeCategoryText]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main List */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filteredExercises.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.exerciseCard} 
            activeOpacity={0.7}
            onPress={() => setSelectedExercise(item)}
          >
            <View style={styles.cardLeft}>
              <View style={styles.muscleIcon}>
                <Ionicons 
                  name={item.muscle === 'Arms' ? 'body' : item.muscle === 'Legs' ? 'walk' : 'barbell'} 
                  size={24} 
                  color="#B514FF" 
                />
              </View>
              <View style={{ flexShrink: 1, paddingRight: 10 }}>
                <Text style={styles.exerciseName}>{item.name}</Text>
                <Text style={styles.exerciseDetail}>{item.muscle} • {item.equipment}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#555" />
          </TouchableOpacity>
        ))}

        {filteredExercises.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#444" />
            <Text style={styles.emptyText}>No exercises match your search.</Text>
          </View>
        )}
        <View style={{height: 120}}/>
      </ScrollView>

      {/* Detailed View Modal */}
      <Modal visible={!!selectedExercise} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          {selectedExercise && (
            <View style={styles.modalContent}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingTop: 10, paddingBottom: 40}}>
                
                <View style={styles.modalDragIndicator} />
                
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedExercise.name}</Text>
                  <TouchableOpacity onPress={() => setSelectedExercise(null)} style={styles.closeButton}>
                    <Ionicons name="close-circle" size={32} color="#444" />
                  </TouchableOpacity>
                </View>

                {/* Primary Labels */}
                <View style={styles.tagRow}>
                  <View style={styles.tagPrimary}>
                    <Ionicons name="scan-outline" size={14} color="#39FF14" style={{marginRight: 4}}/>
                    <Text style={styles.tagPrimaryText}>{selectedExercise.muscle}</Text>
                  </View>
                  <View style={styles.tagSecondary}>
                    <Ionicons name="hardware-chip-outline" size={14} color="#00F0FF" style={{marginRight: 4}}/>
                    <Text style={styles.tagSecondaryText}>{selectedExercise.equipment}</Text>
                  </View>
                </View>

                {/* Secondary Muscles */}
                <View style={styles.divider} />
                <Text style={styles.sectionHeader}>Secondary Muscles</Text>
                <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8}}>
                  {selectedExercise.secondaryMuscles.map(m => (
                    <View key={m} style={styles.tagMuted}>
                      <Text style={styles.tagMutedText}>{m}</Text>
                    </View>
                  ))}
                </View>

                {/* Benefits */}
                <View style={styles.divider} />
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                  <Ionicons name="star" size={20} color="#FFE600" style={{marginRight: 8}}/>
                  <Text style={styles.sectionHeader}>Why do this exercise?</Text>
                </View>
                <Text style={styles.bodyText}>{selectedExercise.benefits}</Text>

                {/* Instructions */}
                <View style={styles.divider} />
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                  <Ionicons name="information-circle" size={22} color="#B514FF" style={{marginRight: 8}}/>
                  <Text style={styles.sectionHeader}>Step-by-step Execution</Text>
                </View>
                <View style={styles.instructionsContainer}>
                  {selectedExercise.instructions.split('\n').map((step, idx) => (
                    <Text key={idx} style={styles.stepText}>{step}</Text>
                  ))}
                </View>

              </ScrollView>

              {/* Action Area */}
              <View style={styles.modalActionArea}>
                {activeWorkout.isActive && (
                  <TouchableOpacity style={[styles.addToListBtn, {marginBottom: 10}]} onPress={handleAddToWorkout}>
                    <LinearGradient colors={['#39FF14', '#00CC10']} style={styles.gradientBtn} start={{x:0, y:0}} end={{x:1, y:1}}>
                      <Ionicons name="add-circle" size={22} color="#000" style={{marginRight: 8}}/>
                      <Text style={[styles.addToListText, {color: '#000'}]}>Add to Workout</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.addToListBtn} onPress={() => setSelectedExercise(null)}>
                  <LinearGradient colors={['#B514FF', '#FF0055']} style={styles.gradientBtn} start={{x:0, y:0}} end={{x:1, y:1}}>
                    <Ionicons name="checkmark-circle" size={24} color="#FFF" style={{marginRight: 8}}/>
                    <Text style={styles.addToListText}>Got It</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

            </View>
          )}
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1014',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  title: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1F24',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    height: 54,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
  },
  categoryScroll: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#1E1F24',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  activeCategoryPill: {
    backgroundColor: 'rgba(181, 20, 255, 0.15)',
    borderColor: '#B514FF',
  },
  categoryText: {
    color: '#888',
    fontWeight: '600',
    fontSize: 14,
  },
  activeCategoryText: {
    color: '#B514FF',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
  },
  exerciseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#17181C',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  muscleIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(181, 20, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  exerciseName: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
  exerciseDetail: {
    color: '#888',
    fontSize: 13,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#666',
    marginTop: 12,
    fontSize: 16,
  },
  // Detailed Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#17181C',
    height: '85%',
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
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    flex: 1,
    marginRight: 20,
  },
  closeButton: {
    marginTop: 2,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  tagPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.3)',
  },
  tagPrimaryText: {
    color: '#39FF14',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  tagSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  tagSecondaryText: {
    color: '#00F0FF',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 20,
  },
  sectionHeader: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  tagMuted: {
    backgroundColor: '#1E1F24',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagMutedText: {
    color: '#BBB',
    fontSize: 13,
  },
  bodyText: {
    color: '#AAA',
    fontSize: 15,
    lineHeight: 24,
    marginTop: 8,
  },
  instructionsContainer: {
    marginTop: 12,
    backgroundColor: '#121212',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  stepText: {
    color: '#DDD',
    fontSize: 15,
    lineHeight: 26,
    marginBottom: 8,
  },
  modalActionArea: {
    paddingVertical: 20,
    backgroundColor: '#17181C',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  addToListBtn: {
    shadowColor: '#B514FF',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  gradientBtn: {
    flexDirection: 'row',
    paddingVertical: 18,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToListText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: 1,
  }
});
