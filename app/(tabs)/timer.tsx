import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, TextInput, Modal, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type TimerMode = 'simple' | 'hiit';

const SIMPLE_PRESETS = [
  { label: '30s', seconds: 30 },
  { label: '60s', seconds: 60 },
  { label: '90s', seconds: 90 },
  { label: '2m', seconds: 120 },
  { label: '3m', seconds: 180 },
  { label: '5m', seconds: 300 },
];

const HIIT_PRESETS = [
  { label: 'Tabata', work: 20, rest: 10, rounds: 8 },
  { label: '30/30', work: 30, rest: 30, rounds: 10 },
  { label: '45/15', work: 45, rest: 15, rounds: 8 },
  { label: 'EMOM', work: 50, rest: 10, rounds: 10 },
];

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

export default function TimerScreen() {
  const [mode, setMode] = useState<TimerMode>('simple');

  // ── Simple Timer ──
  const [simpleTime, setSimpleTime] = useState(60);
  const [simpleLeft, setSimpleLeft] = useState(60);
  const [simpleRunning, setSimpleRunning] = useState(false);
  const simpleRef = useRef<any>(null);
  const [customModal, setCustomModal] = useState(false);
  const [customMin, setCustomMin] = useState('1');
  const [customSec, setCustomSec] = useState('0');

  // ── HIIT Timer ──
  const [hiitWork, setHiitWork] = useState(30);
  const [hiitRest, setHiitRest] = useState(30);
  const [hiitRounds, setHiitRounds] = useState(8);
  const [hiitCurrentRound, setHiitCurrentRound] = useState(1);
  const [hiitPhase, setHiitPhase] = useState<'work' | 'rest' | 'idle' | 'done'>('idle');
  const [hiitLeft, setHiitLeft] = useState(30);
  const [hiitRunning, setHiitRunning] = useState(false);
  const hiitRef = useRef<any>(null);
  const [hiitConfigModal, setHiitConfigModal] = useState(false);
  const [tempWork, setTempWork] = useState('30');
  const [tempRest, setTempRest] = useState('30');
  const [tempRounds, setTempRounds] = useState('8');

  // ── Simple Timer Logic ──
  useEffect(() => {
    if (simpleRunning && simpleLeft > 0) {
      simpleRef.current = setTimeout(() => setSimpleLeft(simpleLeft - 1), 1000);
    } else if (simpleRunning && simpleLeft <= 0) {
      setSimpleRunning(false);
      Vibration.vibrate([200, 200, 200, 200, 200]);
    }
    return () => { if (simpleRef.current) clearTimeout(simpleRef.current); };
  }, [simpleRunning, simpleLeft]);

  const selectSimplePreset = (s: number) => { setSimpleTime(s); setSimpleLeft(s); setSimpleRunning(false); };
  const toggleSimple = () => { if (simpleLeft > 0) setSimpleRunning(!simpleRunning); };
  const resetSimple = () => { setSimpleRunning(false); setSimpleLeft(simpleTime); };
  const applyCustom = () => {
    const total = parseInt(customMin || '0') * 60 + parseInt(customSec || '0');
    if (total > 0) { setSimpleTime(total); setSimpleLeft(total); }
    setCustomModal(false);
  };

  // ── HIIT Timer Logic ──
  useEffect(() => {
    if (hiitRunning && hiitLeft > 0) {
      hiitRef.current = setTimeout(() => setHiitLeft(hiitLeft - 1), 1000);
    } else if (hiitRunning && hiitLeft <= 0) {
      Vibration.vibrate(300);
      if (hiitPhase === 'work') {
        if (hiitCurrentRound >= hiitRounds) {
          setHiitPhase('done');
          setHiitRunning(false);
          Vibration.vibrate([200, 200, 200, 200, 200]);
        } else {
          setHiitPhase('rest');
          setHiitLeft(hiitRest);
        }
      } else if (hiitPhase === 'rest') {
        setHiitCurrentRound(hiitCurrentRound + 1);
        setHiitPhase('work');
        setHiitLeft(hiitWork);
      }
    }
    return () => { if (hiitRef.current) clearTimeout(hiitRef.current); };
  }, [hiitRunning, hiitLeft, hiitPhase, hiitCurrentRound, hiitRounds, hiitRest, hiitWork]);

  const startHiit = () => {
    setHiitCurrentRound(1);
    setHiitPhase('work');
    setHiitLeft(hiitWork);
    setHiitRunning(true);
  };
  const toggleHiit = () => setHiitRunning(!hiitRunning);
  const resetHiit = () => { setHiitRunning(false); setHiitPhase('idle'); setHiitCurrentRound(1); setHiitLeft(hiitWork); };
  const loadHiitPreset = (p: typeof HIIT_PRESETS[0]) => {
    setHiitWork(p.work); setHiitRest(p.rest); setHiitRounds(p.rounds);
    setHiitPhase('idle'); setHiitRunning(false); setHiitCurrentRound(1); setHiitLeft(p.work);
  };
  const applyHiitConfig = () => {
    const w = parseInt(tempWork) || 30;
    const r = parseInt(tempRest) || 30;
    const rds = parseInt(tempRounds) || 8;
    setHiitWork(w); setHiitRest(r); setHiitRounds(rds);
    setHiitPhase('idle'); setHiitRunning(false); setHiitCurrentRound(1); setHiitLeft(w);
    setHiitConfigModal(false);
  };

  const hiitColor = hiitPhase === 'work' ? '#FF0055' : hiitPhase === 'rest' ? '#00F0FF' : hiitPhase === 'done' ? '#39FF14' : '#888';

  // Simple timer color
  const simplePercent = simpleTime > 0 ? simpleLeft / simpleTime : 0;
  const simpleColor = simpleLeft === 0 ? '#39FF14' : simpleRunning ? '#FF6B00' : '#00F0FF';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Timer</Text>
      </View>

      {/* Mode Tabs */}
      <View style={styles.modeTabs}>
        <TouchableOpacity style={[styles.modeTab, mode === 'simple' && styles.modeTabActive]} onPress={() => setMode('simple')}>
          <Ionicons name="timer-outline" size={16} color={mode === 'simple' ? '#FFF' : '#888'} />
          <Text style={[styles.modeTabText, mode === 'simple' && styles.modeTabTextActive]}>Simple</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.modeTab, mode === 'hiit' && styles.modeTabActive]} onPress={() => setMode('hiit')}>
          <Ionicons name="pulse-outline" size={16} color={mode === 'hiit' ? '#FFF' : '#888'} />
          <Text style={[styles.modeTabText, mode === 'hiit' && styles.modeTabTextActive]}>HIIT</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ═══ SIMPLE TIMER ═══ */}
        {mode === 'simple' && (
          <>
            <View style={styles.timerCircle}>
              <LinearGradient colors={[simpleColor, 'transparent']} style={[styles.timerGlow, { opacity: 0.12 }]}>
                <Text style={[styles.timerDisplay, { color: simpleColor }]}>{formatTime(simpleLeft)}</Text>
                {simpleLeft === 0 && <Text style={styles.doneLabel}>DONE!</Text>}
              </LinearGradient>
            </View>

            <View style={styles.controls}>
              <TouchableOpacity style={styles.controlBtn} onPress={resetSimple}>
                <Ionicons name="refresh" size={28} color="#888" />
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleSimple}>
                <LinearGradient colors={simpleRunning ? ['#FF6B00', 'rgba(255,0,85,0.5)'] : ['#00F0FF', 'rgba(0,240,255,0.5)']} style={styles.playBtn}>
                  <Ionicons name={simpleRunning ? 'pause' : 'play'} size={36} color="#000" />
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlBtn} onPress={() => setCustomModal(true)}>
                <Ionicons name="settings-outline" size={28} color="#888" />
              </TouchableOpacity>
            </View>

            <Text style={styles.presetLabel}>PRESETS</Text>
            <View style={styles.presetRow}>
              {SIMPLE_PRESETS.map(p => (
                <TouchableOpacity key={p.label} style={[styles.presetChip, simpleTime === p.seconds && styles.presetChipActive]} onPress={() => selectSimplePreset(p.seconds)}>
                  <Text style={[styles.presetChipText, simpleTime === p.seconds && styles.presetChipTextActive]}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* ═══ HIIT TIMER ═══ */}
        {mode === 'hiit' && (
          <>
            {/* Phase Banner */}
            <View style={[styles.phaseBanner, { backgroundColor: `${hiitColor}12`, borderColor: `${hiitColor}30` }]}>
              <Text style={[styles.phaseLabel, { color: hiitColor }]}>
                {hiitPhase === 'work' ? '🔥 WORK' : hiitPhase === 'rest' ? '💧 REST' : hiitPhase === 'done' ? '✅ COMPLETE' : 'READY'}
              </Text>
              <Text style={styles.roundLabel}>Round {hiitCurrentRound} / {hiitRounds}</Text>
            </View>

            <View style={styles.timerCircle}>
              <LinearGradient colors={[hiitColor, 'transparent']} style={[styles.timerGlow, { opacity: 0.12 }]}>
                <Text style={[styles.timerDisplay, { color: hiitColor }]}>{formatTime(hiitLeft)}</Text>
              </LinearGradient>
            </View>

            {/* Round Progress Dots */}
            <View style={styles.roundDots}>
              {Array.from({ length: hiitRounds }, (_, i) => (
                <View key={i} style={[styles.dot, i < hiitCurrentRound - 1 && styles.dotDone, i === hiitCurrentRound - 1 && hiitPhase !== 'idle' && styles.dotCurrent]} />
              ))}
            </View>

            <View style={styles.controls}>
              <TouchableOpacity style={styles.controlBtn} onPress={resetHiit}>
                <Ionicons name="refresh" size={28} color="#888" />
              </TouchableOpacity>
              <TouchableOpacity onPress={hiitPhase === 'idle' || hiitPhase === 'done' ? startHiit : toggleHiit}>
                <LinearGradient colors={hiitRunning ? ['#FF0055', 'rgba(255,0,85,0.5)'] : ['#39FF14', 'rgba(57,255,20,0.5)']} style={styles.playBtn}>
                  <Ionicons name={hiitRunning ? 'pause' : 'play'} size={36} color="#000" />
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlBtn} onPress={() => {
                setTempWork(hiitWork.toString()); setTempRest(hiitRest.toString()); setTempRounds(hiitRounds.toString());
                setHiitConfigModal(true);
              }}>
                <Ionicons name="settings-outline" size={28} color="#888" />
              </TouchableOpacity>
            </View>

            {/* Config Summary */}
            <View style={styles.hiitConfig}>
              <View style={styles.hiitConfigItem}>
                <Text style={styles.hiitConfigLabel}>Work</Text>
                <Text style={styles.hiitConfigValue}>{hiitWork}s</Text>
              </View>
              <View style={styles.hiitConfigDivider} />
              <View style={styles.hiitConfigItem}>
                <Text style={styles.hiitConfigLabel}>Rest</Text>
                <Text style={styles.hiitConfigValue}>{hiitRest}s</Text>
              </View>
              <View style={styles.hiitConfigDivider} />
              <View style={styles.hiitConfigItem}>
                <Text style={styles.hiitConfigLabel}>Rounds</Text>
                <Text style={styles.hiitConfigValue}>{hiitRounds}</Text>
              </View>
            </View>

            <Text style={styles.presetLabel}>HIIT PRESETS</Text>
            <View style={styles.presetRow}>
              {HIIT_PRESETS.map(p => (
                <TouchableOpacity key={p.label} style={styles.presetChip} onPress={() => loadHiitPreset(p)}>
                  <Text style={styles.presetChipText}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Custom Timer Modal */}
      <Modal visible={customModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalBoxTitle}>Set Timer</Text>
            <View style={styles.timeInputRow}>
              <View style={styles.timeInputGroup}>
                <TextInput style={styles.timeInput} value={customMin} onChangeText={setCustomMin} keyboardType="numeric" maxLength={2} />
                <Text style={styles.timeInputLabel}>min</Text>
              </View>
              <Text style={styles.timeColon}>:</Text>
              <View style={styles.timeInputGroup}>
                <TextInput style={styles.timeInput} value={customSec} onChangeText={setCustomSec} keyboardType="numeric" maxLength={2} />
                <Text style={styles.timeInputLabel}>sec</Text>
              </View>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setCustomModal(false)}>
                <Text style={{ color: '#888', fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={applyCustom}>
                <LinearGradient colors={['#00F0FF', 'rgba(0,240,255,0.5)']} style={styles.modalApply}>
                  <Text style={{ color: '#000', fontWeight: '800' }}>Apply</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* HIIT Config Modal */}
      <Modal visible={hiitConfigModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalBoxTitle}>HIIT Configuration</Text>
            <View style={styles.configRow}>
              <Text style={styles.configLabel}>Work (sec)</Text>
              <TextInput style={styles.configInput} value={tempWork} onChangeText={setTempWork} keyboardType="numeric" />
            </View>
            <View style={styles.configRow}>
              <Text style={styles.configLabel}>Rest (sec)</Text>
              <TextInput style={styles.configInput} value={tempRest} onChangeText={setTempRest} keyboardType="numeric" />
            </View>
            <View style={styles.configRow}>
              <Text style={styles.configLabel}>Rounds</Text>
              <TextInput style={styles.configInput} value={tempRounds} onChangeText={setTempRounds} keyboardType="numeric" />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setHiitConfigModal(false)}>
                <Text style={{ color: '#888', fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={applyHiitConfig}>
                <LinearGradient colors={['#39FF14', 'rgba(57,255,20,0.5)']} style={styles.modalApply}>
                  <Text style={{ color: '#000', fontWeight: '800' }}>Apply</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1014' },
  header: { padding: 20, paddingTop: Platform.OS === 'android' ? 44 : 20 },
  headerTitle: { color: '#FFF', fontSize: 28, fontWeight: '800' },
  scrollContent: { padding: 20, alignItems: 'center' },

  modeTabs: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#1A1B20', borderRadius: 12, padding: 4 },
  modeTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 6 },
  modeTabActive: { backgroundColor: '#2A2B30' },
  modeTabText: { color: '#888', fontWeight: '600', fontSize: 14 },
  modeTabTextActive: { color: '#FFF' },

  timerCircle: { width: 240, height: 240, borderRadius: 120, justifyContent: 'center', alignItems: 'center', marginVertical: 30 },
  timerGlow: { width: 240, height: 240, borderRadius: 120, justifyContent: 'center', alignItems: 'center' },
  timerDisplay: { fontSize: 56, fontWeight: '800', fontVariant: ['tabular-nums'] },
  doneLabel: { color: '#39FF14', fontSize: 16, fontWeight: '700', marginTop: 4 },

  controls: { flexDirection: 'row', alignItems: 'center', gap: 30, marginBottom: 30 },
  controlBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#1E1F24', justifyContent: 'center', alignItems: 'center' },
  playBtn: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center' },

  presetLabel: { color: '#555', fontSize: 12, fontWeight: '700', letterSpacing: 2, alignSelf: 'flex-start', marginBottom: 12, width: '100%' },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, width: '100%' },
  presetChip: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: '#1E1F24', borderRadius: 10 },
  presetChipActive: { backgroundColor: 'rgba(0,240,255,0.15)', borderWidth: 1, borderColor: '#00F0FF' },
  presetChipText: { color: '#888', fontWeight: '600' },
  presetChipTextActive: { color: '#00F0FF' },

  // HIIT
  phaseBanner: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14, borderWidth: 1 },
  phaseLabel: { fontSize: 18, fontWeight: '800' },
  roundLabel: { color: '#888', fontWeight: '600' },

  roundDots: { flexDirection: 'row', gap: 6, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2A2B30' },
  dotDone: { backgroundColor: '#39FF14' },
  dotCurrent: { backgroundColor: '#FF6B00', width: 14, height: 14, borderRadius: 7 },

  hiitConfig: { flexDirection: 'row', backgroundColor: '#1A1B20', borderRadius: 14, padding: 16, width: '100%', marginBottom: 24 },
  hiitConfigItem: { flex: 1, alignItems: 'center' },
  hiitConfigLabel: { color: '#888', fontSize: 12, fontWeight: '600' },
  hiitConfigValue: { color: '#FFF', fontSize: 20, fontWeight: '800', marginTop: 4 },
  hiitConfigDivider: { width: 1, backgroundColor: '#2A2B30' },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#1A1B20', borderRadius: 20, padding: 24, width: '85%' },
  modalBoxTitle: { color: '#FFF', fontSize: 20, fontWeight: '800', marginBottom: 20, textAlign: 'center' },
  timeInputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 24 },
  timeInputGroup: { alignItems: 'center' },
  timeInput: { backgroundColor: '#0F1014', color: '#FFF', fontSize: 28, fontWeight: '800', width: 80, height: 60, textAlign: 'center', borderRadius: 12 },
  timeInputLabel: { color: '#888', fontSize: 12, marginTop: 6 },
  timeColon: { color: '#FFF', fontSize: 28, fontWeight: '800' },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalCancel: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12, backgroundColor: '#0F1014' },
  modalApply: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12 },

  configRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  configLabel: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  configInput: { backgroundColor: '#0F1014', color: '#FFF', fontSize: 20, fontWeight: '800', width: 80, height: 48, textAlign: 'center', borderRadius: 10 },
});
