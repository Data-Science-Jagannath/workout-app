import { Tabs } from 'expo-router';
import React from 'react';
import { BlurView } from 'expo-blur';
import { View, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: '#121212E6',
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#39FF14',
        tabBarInactiveTintColor: '#888',
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView tint="dark" intensity={80} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={{ flex: 1, backgroundColor: '#121212FA' }} />
          )
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? 'home' : 'home-outline'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="templates"
        options={{
          title: 'Templates',
          tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? 'fitness' : 'fitness-outline'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          title: 'Timer',
          tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? 'timer' : 'timer-outline'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? 'library' : 'library-outline'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? 'bar-chart' : 'bar-chart-outline'} color={color} />,
        }}
      />
    </Tabs>
  );
}
