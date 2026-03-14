import React, { createContext, useState, useContext, useEffect, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ───────────────────────────────────────────
export type WorkoutSet = {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
};

export type WorkoutExercise = {
  id: string;
  name: string;
  sets: WorkoutSet[];
  restSeconds?: number;
};

export type CompletedWorkout = {
  id: string;
  date: string;
  title: string;
  volume: string;
  duration: string;
  prs: number;
  exercises: WorkoutExercise[];
  timestamp: number;
};

export type WorkoutTemplate = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  estimatedMinutes: number;
  restSeconds: number;
  exercises: { name: string; defaultSets: number; defaultReps: string }[];
};

// ─── Active Workout State ────────────────────────────
export type ActiveWorkout = {
  template: WorkoutTemplate | null;
  sessionName: string;
  exercises: WorkoutExercise[];
  startTime: number;
  isActive: boolean;
  timerStarted: boolean;
};

// ─── Context Type ────────────────────────────────────
type WorkoutContextType = {
  history: CompletedWorkout[];
  addWorkoutToHistory: (workout: CompletedWorkout) => void;
  // Active workout
  activeWorkout: ActiveWorkout;
  startWorkout: (template: WorkoutTemplate) => void;
  startCustomWorkout: () => void;
  startTimer: () => void;
  finishActiveWorkout: () => CompletedWorkout | null;
  cancelActiveWorkout: () => void;
  updateActiveExercises: (exercises: WorkoutExercise[]) => void;
  updateSessionName: (name: string) => void;
  addExerciseToActive: (name: string) => void;
  // Elapsed
  elapsedSeconds: number;
};

const STORAGE_KEY = '@workout_history';

const generateId = () => Math.random().toString(36).substr(2, 9);

const defaultActiveWorkout: ActiveWorkout = {
  template: null,
  sessionName: 'New Workout',
  exercises: [],
  startTime: 0,
  isActive: false,
  timerStarted: false,
};

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<CompletedWorkout[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout>(defaultActiveWorkout);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<any>(null);

  // ── Load history from AsyncStorage on mount ──
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setHistory(JSON.parse(stored));
        }
      } catch (e) {
        console.warn('Failed to load workout history', e);
      }
    })();
  }, []);

  // ── Persist history on every change ──
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      } catch (e) {
        console.warn('Failed to save workout history', e);
      }
    })();
  }, [history]);

  // ── Elapsed timer (only runs after timerStarted) ──
  useEffect(() => {
    if (activeWorkout.isActive && activeWorkout.timerStarted) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - activeWorkout.startTime) / 1000));
      }, 1000);
    } else if (!activeWorkout.isActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setElapsedSeconds(0);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [activeWorkout.isActive, activeWorkout.timerStarted, activeWorkout.startTime]);

  // ── Actions ──
  const addWorkoutToHistory = (workout: CompletedWorkout) => {
    setHistory((prev) => [workout, ...prev]);
  };

  const startWorkout = (template: WorkoutTemplate) => {
    const exercises: WorkoutExercise[] = template.exercises.map(ex => ({
      id: generateId(),
      name: ex.name,
      restSeconds: template.restSeconds,
      sets: Array.from({ length: ex.defaultSets }, () => ({
        id: generateId(),
        weight: '',
        reps: ex.defaultReps,
        completed: false,
      })),
    }));

    setActiveWorkout({
      template,
      sessionName: template.title,
      exercises,
      startTime: 0,
      isActive: true,
      timerStarted: false,
    });
  };

  const startCustomWorkout = () => {
    setActiveWorkout({
      template: null,
      sessionName: 'Custom Workout',
      exercises: [],
      startTime: 0,
      isActive: true,
      timerStarted: false,
    });
  };

  const startTimer = () => {
    setActiveWorkout(prev => ({
      ...prev,
      startTime: Date.now(),
      timerStarted: true,
    }));
  };

  const finishActiveWorkout = (): CompletedWorkout | null => {
    if (!activeWorkout.isActive) return null;

    let totalVolume = 0;
    let prs = Math.floor(Math.random() * 3);
    activeWorkout.exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (set.completed && set.weight && set.reps) {
          totalVolume += parseInt(set.weight) * parseInt(set.reps);
        }
      });
    });

    const durationSec = Math.floor((Date.now() - activeWorkout.startTime) / 1000);
    const mins = Math.floor(durationSec / 60);
    const secs = durationSec % 60;
    const durationStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    });

    const completed: CompletedWorkout = {
      id: generateId(),
      date: dateStr,
      title: activeWorkout.sessionName,
      volume: `${totalVolume.toLocaleString()} lbs`,
      duration: durationStr,
      prs,
      exercises: activeWorkout.exercises,
      timestamp: Date.now(),
    };

    addWorkoutToHistory(completed);
    setActiveWorkout(defaultActiveWorkout);
    return completed;
  };

  const cancelActiveWorkout = () => {
    setActiveWorkout(defaultActiveWorkout);
  };

  const updateActiveExercises = (exercises: WorkoutExercise[]) => {
    setActiveWorkout(prev => ({ ...prev, exercises }));
  };

  const updateSessionName = (name: string) => {
    setActiveWorkout(prev => ({ ...prev, sessionName: name }));
  };

  const addExerciseToActive = (name: string) => {
    if (!activeWorkout.isActive) return;
    const newExercise: WorkoutExercise = {
      id: generateId(),
      name,
      sets: [{ id: generateId(), weight: '', reps: '', completed: false }],
    };
    setActiveWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise],
    }));
  };

  return (
    <WorkoutContext.Provider value={{
      history,
      addWorkoutToHistory,
      activeWorkout,
      startWorkout,
      startCustomWorkout,
      startTimer,
      finishActiveWorkout,
      cancelActiveWorkout,
      updateActiveExercises,
      updateSessionName,
      addExerciseToActive,
      elapsedSeconds,
    }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkoutContext() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkoutContext must be used within a WorkoutProvider');
  }
  return context;
}
