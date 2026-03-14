import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutContext } from '@/context/WorkoutContext';
import { useAuth } from '@/context/AuthContext';

export default function HistoryScreen() {
  const { history } = useWorkoutContext();
  const { units } = useAuth();
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);

  // Calculate stats based on history
  const totalWorkouts = history.length;
  
  let totalVolume = 0;
  let totalPrs = 0;

  history.forEach(workout => {
    const volNum = parseInt(workout.volume.replace(/\D/g, ''));
    if (!isNaN(volNum)) {
      totalVolume += volNum;
    }
    totalPrs += workout.prs;
  });

  const displayVolume = totalVolume > 1000 
    ? `${(totalVolume / 1000).toFixed(1)}k` 
    : totalVolume.toString();
  
  const unitLabel = units.weight === 'lbs' ? 'Lbs' : 'kg';

  const streak = totalWorkouts > 0 ? 1 : 0; 

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={24} color="#FF6B00" />
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="barbell" size={24} color="#00F0FF" />
            <Text style={styles.statValue}>{displayVolume}</Text>
            <Text style={styles.statLabel}>{unitLabel} Lifted</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color="#FFE600" />
            <Text style={styles.statValue}>{totalPrs}</Text>
            <Text style={styles.statLabel}>New PRs</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent Workouts</Text>

        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={64} color="#333" />
            <Text style={styles.emptyTitle}>No history yet</Text>
            <Text style={styles.emptyText}>Go to the Track tab to log your first workout session.</Text>
          </View>
        ) : (
          history.map((session) => (
            <TouchableOpacity 
              key={session.id} 
              style={styles.historyCard} 
              activeOpacity={0.7}
              onPress={() => setSelectedWorkout(session)}
            >
              <View style={styles.cardLeft}>
                <View style={styles.dateCircle}>
                  <Text style={styles.dateText}>
                    {session.date.substring(0,3).toUpperCase()}
                  </Text>
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.workoutTitle}>{session.title}</Text>
                  <Text style={styles.workoutSubtitle}>{session.date} • {session.duration}</Text>
                  {session.exercises && session.exercises.length > 0 && (
                    <Text style={styles.exercisePreview} numberOfLines={1}>
                      {session.exercises.map((ex: any) => ex.name).join(', ')}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.volumeText}>{session.volume}</Text>
                {session.prs > 0 && (
                  <View style={styles.prBadge}>
                    <Text style={styles.prText}>{session.prs} PR{session.prs > 1 ? 's' : ''}</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={16} color="#555" style={{marginTop: 6}} />
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{height: 100}}/>
      </ScrollView>

      {/* Workout Detail Modal */}
      <Modal visible={!!selectedWorkout} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedWorkout && (
              <>
                <View style={styles.modalHeader}>
                  <View style={{flex: 1}}>
                    <Text style={styles.modalTitle}>{selectedWorkout.title}</Text>
                    <Text style={styles.modalSubtitle}>
                      {selectedWorkout.date} • {selectedWorkout.duration} • {selectedWorkout.volume}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedWorkout(null)} style={styles.closeButton}>
                    <Ionicons name="close-circle" size={32} color="#555" />
                  </TouchableOpacity>
                </View>

                {selectedWorkout.prs > 0 && (
                  <View style={styles.prBanner}>
                    <Ionicons name="trophy" size={18} color="#FFE600" />
                    <Text style={styles.prBannerText}>
                      {selectedWorkout.prs} Personal Record{selectedWorkout.prs > 1 ? 's' : ''} set!
                    </Text>
                  </View>
                )}

                <ScrollView showsVerticalScrollIndicator={false} style={{flex: 1}}>
                  {selectedWorkout.exercises && selectedWorkout.exercises.length > 0 ? (
                    selectedWorkout.exercises.map((exercise: any, exIndex: number) => (
                      <View key={exercise.id || exIndex} style={styles.detailExerciseCard}>
                        <View style={styles.detailExerciseHeader}>
                          <View style={styles.detailIconWrap}>
                            <Ionicons name="barbell" size={20} color="#00F0FF" />
                          </View>
                          <Text style={styles.detailExerciseName}>{exercise.name}</Text>
                        </View>

                        <View style={styles.detailTableHeader}>
                          <Text style={[styles.detailHeaderCol, {flex: 0.5}]}>Set</Text>
                          <Text style={[styles.detailHeaderCol, {flex: 1}]}>{units.weight}</Text>
                          <Text style={[styles.detailHeaderCol, {flex: 1}]}>Reps</Text>
                          <Text style={[styles.detailHeaderCol, {flex: 0.5, textAlign: 'center'}]}>
                            <Ionicons name="checkmark-done" size={16} color="#555" />
                          </Text>
                        </View>

                        {exercise.sets.map((set: any, setIndex: number) => (
                          <View 
                            key={set.id || setIndex} 
                            style={[
                              styles.detailSetRow, 
                              set.completed && styles.detailSetRowCompleted
                            ]}
                          >
                            <Text style={[styles.detailSetNum, {flex: 0.5}]}>{setIndex + 1}</Text>
                            <Text style={[styles.detailSetValue, {flex: 1}]}>
                              {set.weight || '-'}
                            </Text>
                            <Text style={[styles.detailSetValue, {flex: 1}]}>
                              {set.reps || '-'}
                            </Text>
                            <View style={{flex: 0.5, alignItems: 'center'}}>
                              <Ionicons 
                                name={set.completed ? "checkmark-circle" : "checkmark-circle-outline"} 
                                size={22} 
                                color={set.completed ? "#39FF14" : "#333"} 
                              />
                            </View>
                          </View>
                        ))}
                      </View>
                    ))
                  ) : (
                    <View style={styles.noDataState}>
                      <Ionicons name="document-text-outline" size={48} color="#333" />
                      <Text style={{color: '#666', marginTop: 12}}>No exercise details recorded.</Text>
                    </View>
                  )}
                  <View style={{height: 40}} />
                </ScrollView>
              </>
            )}
          </View>
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
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 10,
  },
  title: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E1F24',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: '#17181C',
    borderRadius: 16,
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#17181C',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dateText: {
    color: '#39FF14',
    fontWeight: '700',
    fontSize: 12,
  },
  workoutTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  workoutSubtitle: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  exercisePreview: {
    color: '#555',
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
  cardRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  volumeText: {
    color: '#FFF',
    fontWeight: '600',
  },
  prBadge: {
    backgroundColor: 'rgba(255, 230, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 6,
  },
  prText: {
    color: '#FFE600',
    fontSize: 10,
    fontWeight: '700',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#121215',
    height: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
  },
  modalSubtitle: {
    color: '#888',
    fontSize: 14,
    marginTop: 6,
  },
  closeButton: {
    padding: 4,
  },
  prBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 230, 0, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 230, 0, 0.15)',
  },
  prBannerText: {
    color: '#FFE600',
    fontWeight: '600',
    fontSize: 14,
  },
  detailExerciseCard: {
    backgroundColor: '#1E1F24',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  detailExerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  detailIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailExerciseName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  detailTableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 6,
    marginBottom: 8,
  },
  detailHeaderCol: {
    color: '#555',
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: 11,
  },
  detailSetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    marginBottom: 4,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  detailSetRowCompleted: {
    backgroundColor: 'rgba(57, 255, 20, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.15)',
  },
  detailSetNum: {
    color: '#888',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
  detailSetValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  noDataState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
});
