import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, TextInput, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user, logout, updateProfile, units, updateUnits } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      updateProfile({ photoUri: result.assets[0].uri });
    }
  };

  const handleSave = async () => {
    await updateProfile({ name, email });
    Alert.alert('Success', 'Profile updated successfully');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
        await logout();
        router.replace('/auth');
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-down" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <View style={{width: 28}} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
            {user?.photoUri ? (
              <Image source={{uri: user.photoUri}} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="person" size={40} color="#39FF14" />
              </View>
            )}
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={14} color="#000" />
            </View>
          </TouchableOpacity>
          <Text style={styles.phoneText}>{user?.phoneNumber}</Text>
        </View>

        {/* Inputs */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PERSONAL INFORMATION</Text>
          <View style={styles.inputCard}>
            <View style={styles.inputRow}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Name"
                placeholderTextColor="#666"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="#666"
                autoCapitalize="none"
              />
            </View>
          </View>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Update Info</Text>
          </TouchableOpacity>
        </View>

        {/* Unit Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>UNIT PREFERENCES</Text>
          <View style={styles.inputCard}>
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingTitle}>Weight Unit</Text>
                <Text style={styles.settingSub}>Choose how to measure your lifts</Text>
              </View>
              <View style={styles.toggleGroup}>
                <TouchableOpacity 
                  style={[styles.toggleBtn, units.weight === 'kg' && styles.toggleBtnActive]}
                  onPress={() => updateUnits({ weight: 'kg' })}
                >
                  <Text style={[styles.toggleText, units.weight === 'kg' && styles.toggleTextActive]}>kg</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.toggleBtn, units.weight === 'lbs' && styles.toggleBtnActive]}
                  onPress={() => updateUnits({ weight: 'lbs' })}
                >
                  <Text style={[styles.toggleText, units.weight === 'lbs' && styles.toggleTextActive]}>lbs</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingTitle}>Height Unit</Text>
                <Text style={styles.settingSub}>For body measurement logs</Text>
              </View>
              <View style={styles.toggleGroup}>
                <TouchableOpacity 
                  style={[styles.toggleBtn, units.height === 'cm' && styles.toggleBtnActive]}
                  onPress={() => updateUnits({ height: 'cm' })}
                >
                  <Text style={[styles.toggleText, units.height === 'cm' && styles.toggleTextActive]}>cm</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.toggleBtn, units.height === 'ft-in' && styles.toggleBtnActive]}
                  onPress={() => updateUnits({ height: 'ft-in' })}
                >
                  <Text style={[styles.toggleText, units.height === 'ft-in' && styles.toggleTextActive]}>ft/in</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF0055" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1014' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  backButton: { padding: 4 },
  scrollContent: { paddingHorizontal: 20 },
  profileSection: { alignItems: 'center', marginVertical: 30 },
  photoContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1E1F24', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  photo: { width: 100, height: 100, borderRadius: 50 },
  photoPlaceholder: { alignItems: 'center' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#39FF14', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#0F1014' },
  phoneText: { color: '#888', fontSize: 16, marginTop: 12, fontWeight: '600' },
  section: { marginBottom: 30 },
  sectionLabel: { color: '#555', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginBottom: 15 },
  inputCard: { backgroundColor: '#1E1F24', borderRadius: 16, overflow: 'hidden' },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  icon: { marginRight: 15 },
  input: { flex: 1, color: '#FFF', fontSize: 16 },
  divider: { height: 1, backgroundColor: '#2A2C33' },
  saveBtn: { marginTop: 12, alignSelf: 'flex-end' },
  saveBtnText: { color: '#39FF14', fontWeight: '700' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  settingTitle: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  settingSub: { color: '#666', fontSize: 12, marginTop: 2 },
  toggleGroup: { flexDirection: 'row', backgroundColor: '#0F1014', padding: 4, borderRadius: 10 },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  toggleBtnActive: { backgroundColor: '#2A2C33' },
  toggleText: { color: '#666', fontWeight: '600', fontSize: 14 },
  toggleTextActive: { color: '#39FF14' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 0, 85, 0.1)', paddingVertical: 16, borderRadius: 16, gap: 10 },
  logoutText: { color: '#FF0055', fontWeight: '800', fontSize: 16 }
});
