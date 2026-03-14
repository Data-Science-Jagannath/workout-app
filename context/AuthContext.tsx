import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserProfile = {
  phoneNumber: string;
  email: string;
  name: string;
  photoUri?: string;
};

export type UnitSettings = {
  weight: 'kg' | 'lbs';
  height: 'cm' | 'ft-in';
};

type AuthContextType = {
  user: UserProfile | null;
  isLoading: boolean;
  login: (profile: UserProfile) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  units: UnitSettings;
  updateUnits: (units: Partial<UnitSettings>) => Promise<void>;
};

const USER_STORAGE_KEY = '@user_profile';
const UNIT_STORAGE_KEY = '@unit_settings';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [units, setUnits] = useState<UnitSettings>({ weight: 'lbs', height: 'ft-in' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [storedUser, storedUnits] = await Promise.all([
          AsyncStorage.getItem(USER_STORAGE_KEY),
          AsyncStorage.getItem(UNIT_STORAGE_KEY),
        ]);

        if (storedUser) setUser(JSON.parse(storedUser));
        if (storedUnits) setUnits(JSON.parse(storedUnits));
      } catch (e) {
        console.warn('Failed to load auth state', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (profile: UserProfile) => {
    setUser(profile);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const newUser = { ...user, ...updates };
    setUser(newUser);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
  };

  const updateUnits = async (updates: Partial<UnitSettings>) => {
    const newUnits = { ...units, ...updates };
    setUnits(newUnits);
    await AsyncStorage.setItem(UNIT_STORAGE_KEY, JSON.stringify(newUnits));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout, 
      updateProfile, 
      units, 
      updateUnits 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
