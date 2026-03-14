import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export default function AuthScreen() {
  const auth = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState<'phone' | 'otp' | 'email'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Email validation regex (strict domain check)
  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // Basic domain check to avoid common dummy patterns
    const dummyDomains = ['dummy.com', 'test.com', 'foo.com', 'example.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (!re.test(email)) return 'Invalid email format';
    if (dummyDomains.includes(domain)) return 'Dummy email domains are not allowed';
    return null;
  };

  const handleSendOtp = async () => {
    if (phoneNumber.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number');
      return;
    }
    setIsLoading(true);
    // Mock API call
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      Alert.alert('Verification Code', 'Your dummy OTP is: 123456');
    }, 1500);
  };

  const handleVerifyOtp = async () => {
    if (otp !== '123456') {
      Alert.alert('Invalid OTP', 'The code you entered is incorrect. Use 123456 for the dummy service.');
      return;
    }
    setIsLoading(true);
    // Mock verification
    setTimeout(() => {
      setIsLoading(false);
      setStep('email');
    }, 1500);
  };

  const handleCompleteProfile = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      Alert.alert('Invalid Email', emailError);
      return;
    }
    if (name.length < 2) {
      Alert.alert('Invalid Name', 'Please enter your name');
      return;
    }

    setIsLoading(true);
    await auth.login({ phoneNumber, email, name });
    setIsLoading(false);
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <LinearGradient colors={['#0F1014', '#1E1F24']} style={styles.gradient}>
        
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="fitness" size={60} color="#39FF14" />
          </View>
          
          <Text style={styles.title}>
            {step === 'phone' && 'Welcome to Workout App'}
            {step === 'otp' && 'Verify Phone'}
            {step === 'email' && 'Complete Profile'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'phone' && 'Enter your phone number to get started'}
            {step === 'otp' && `Code sent to ${phoneNumber}`}
            {step === 'email' && 'Almost there! Set up your profile'}
          </Text>

          {step === 'phone' && (
            <View style={styles.inputArea}>
              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor="#666"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>
              <TouchableOpacity style={styles.button} onPress={handleSendOtp} disabled={isLoading}>
                <LinearGradient colors={['#39FF14', '#00F0FF']} style={styles.buttonGrad} start={{x:0,y:0}} end={{x:1,y:0}}>
                  {isLoading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>SEND OTP</Text>}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {step === 'otp' && (
            <View style={styles.inputArea}>
              <View style={styles.inputWrapper}>
                <Ionicons name="keypad-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="6-Digit Code"
                  placeholderTextColor="#666"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                />
              </View>
              <TouchableOpacity style={styles.button} onPress={handleVerifyOtp} disabled={isLoading}>
                <LinearGradient colors={['#39FF14', '#00F0FF']} style={styles.buttonGrad} start={{x:0,y:0}} end={{x:1,y:0}}>
                  {isLoading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>VERIFY CODE</Text>}
                </LinearGradient>
              </TouchableOpacity>
              <Text style={styles.hintText}>Demo Code: 123456</Text>
              <TouchableOpacity onPress={() => setStep('phone')} style={styles.backBtn}>
                <Text style={styles.backText}>Change number</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'email' && (
            <View style={styles.inputArea}>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#666"
                  value={name}
                  onChangeText={setName}
                />
              </View>
              <View style={[styles.inputWrapper, {marginTop: 15}]}>
                <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#666"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
              <TouchableOpacity style={styles.button} onPress={handleCompleteProfile} disabled={isLoading}>
                <LinearGradient colors={['#39FF14', '#00F0FF']} style={styles.buttonGrad} start={{x:0,y:0}} end={{x:1,y:0}}>
                  {isLoading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>START TRAINING</Text>}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1014' },
  gradient: { flex: 1 },
  content: { flex: 1, padding: 30, justifyContent: 'center', alignItems: 'center' },
  iconContainer: { width: 100, height: 100, borderRadius: 30, backgroundColor: 'rgba(57, 255, 20, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { color: '#FFF', fontSize: 28, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: '#888', fontSize: 16, textAlign: 'center', marginTop: 10, marginBottom: 40 },
  inputArea: { width: '100%' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1F24', borderRadius: 12, paddingHorizontal: 15, height: 56, borderWidth: 1, borderColor: '#333' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#FFF', fontSize: 16 },
  button: { marginTop: 30, height: 56, borderRadius: 12, overflow: 'hidden' },
  buttonGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#000', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
  backBtn: { marginTop: 20, alignItems: 'center' },
  backText: { color: '#888', fontSize: 14, textDecorationLine: 'underline' },
  hintText: { color: '#444', fontSize: 12, textAlign: 'center', marginTop: 15, fontWeight: '600' }
});
