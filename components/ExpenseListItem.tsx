import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ShoppingBag, Coffee, Car, Home, Film, Flag, MoreHorizontal } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { THEME_COLORS } from '@/constants/colors';
import { ExpenseData } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';

interface ExpenseListItemProps {
  expense: ExpenseData;
}

export default function ExpenseListItem({ expense }: ExpenseListItemProps) {
  const { theme } = useTheme();
  const colors = THEME_COLORS[theme];
  const router = useRouter();
  
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'food':
        return <Coffee size={24} color={colors.primary} />;
      case 'transport':
        return <Car size={24} color={colors.primary} />;
      case 'accommodation':
        return <Home size={24} color={colors.primary} />;
      case 'shopping':
        return <ShoppingBag size={24} color={colors.primary} />;
      case 'entertainment':
        return <Film size={24} color={colors.primary} />;
      case 'activities':
        return <Flag size={24} color={colors.primary} />;
      default:
        return <MoreHorizontal size={24} color={colors.primary} />;
    }
  };
  
  const handlePress = () => {
    router.push(`/expense-details?id=${expense.id}`);
  };
  
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={handlePress}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
        {getCategoryIcon(expense.category)}
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {expense.title}
        </Text>
        <Text style={[styles.date, { color: colors.textLight }]}>
          {format(new Date(expense.date), 'MMM d, yyyy')}
        </Text>
      </View>
      
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatCurrency(expense.amount, expense.currency)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  date: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
});