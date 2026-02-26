import React from 'react';
import { Tabs } from 'expo-router';
import { Home, ListChecks, BookOpen, UserCircle, Zap, Gift } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';

export default function TabLayout() {
  const { appMode } = useApp();
  const isChild = appMode === 'child';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isChild ? '#6C5CE7' : Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: isChild ? '#F7F5FF' : Colors.surface,
          borderTopColor: isChild ? '#E8E4FF' : Colors.divider,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600' as const,
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Habits',
          tabBarIcon: ({ color, size }) => <ListChecks size={size} color={color} />,
          href: isChild ? null : '/habits',
        }}
      />
      <Tabs.Screen
        name="gameday"
        options={{
          title: 'Game Day',
          tabBarIcon: ({ color, size }) => <Zap size={size} color={color} />,
          href: isChild ? null : '/gameday',
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
          href: isChild ? null : '/learn',
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: 'Rewards',
          tabBarIcon: ({ color, size }) => <Gift size={size} color={color} />,
          href: isChild ? null : '/rewards',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <UserCircle size={size} color={color} />,
          href: isChild ? null : '/profile',
        }}
      />
    </Tabs>
  );
}
