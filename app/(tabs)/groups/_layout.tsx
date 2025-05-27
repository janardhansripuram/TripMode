import { Tabs } from 'expo-router';
import { Users, PlusCircle, Receipt } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { THEME_COLORS } from '@/constants/colors';

export default function GroupsLayout() {
  const { theme } = useTheme();
  const colors = THEME_COLORS[theme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="new"
        options={{
          title: 'New Group',
          tabBarIcon: ({ color, size }) => <PlusCircle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Expenses',
          tabBarIcon: ({ color, size }) => <Receipt size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}