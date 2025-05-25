import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { Link } from 'expo-router';
import { PlusCircle, TrendingUp, ArrowRight, Receipt } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { THEME_COLORS } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { fetchRecentExpenses, fetchActiveTrips, fetchTotalSpent } from '@/services/expenseService';
import { formatCurrency } from '@/utils/formatters';
import ExpenseListItem from '@/components/ExpenseListItem';
import TripCard from '@/components/TripCard';
import { ExpenseData, TripData } from '@/types';

export default function HomeScreen() {
  const { theme } = useTheme();
  const colors = THEME_COLORS[theme];
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentExpenses, setRecentExpenses] = useState<ExpenseData[]>([]);
  const [activeTrips, setActiveTrips] = useState<TripData[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  
  const loadData = async () => {
    try {
      const [expensesData, tripsData, spentData] = await Promise.all([
        fetchRecentExpenses(),
        fetchActiveTrips(),
        fetchTotalSpent()
      ]);
      
      setRecentExpenses(expensesData);
      setActiveTrips(tripsData);
      setTotalSpent(spentData);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    loadData();
  }, []);
  
  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };
  
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>
              Hello, {user?.displayName || 'Traveler'}
            </Text>
            <Text style={[styles.subGreeting, { color: colors.textLight }]}>
              Track your expenses with ease
            </Text>
          </View>
          
          <TouchableOpacity style={[styles.profileImage, { borderColor: colors.primary }]}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.profilePic} />
            ) : (
              <Text style={[styles.profileInitial, { color: colors.primary }]}>
                {user?.displayName ? user.displayName[0].toUpperCase() : 'T'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={[styles.overviewCard, { backgroundColor: colors.card }]}>
          <View style={styles.overviewHeader}>
            <Text style={[styles.overviewTitle, { color: colors.text }]}>Total Spent</Text>
            <TrendingUp size={20} color={colors.success} />
          </View>
          
          <Text style={[styles.overviewAmount, { color: colors.text }]}>
            {formatCurrency(totalSpent)}
          </Text>
          
          <View style={styles.quickActions}>
            <Link href="/add-expense" asChild>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]}>
                <PlusCircle size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Add Expense</Text>
              </TouchableOpacity>
            </Link>
            
            <Link href="/trips/new" asChild>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.secondary }]}>
                <PlusCircle size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>New Trip</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Trips</Text>
            <Link href="/trips" asChild>
              <TouchableOpacity style={styles.viewAll}>
                <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
                <ArrowRight size={16} color={colors.primary} />
              </TouchableOpacity>
            </Link>
          </View>
          
          {activeTrips.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.cardAlt }]}>
              <Text style={[styles.emptyStateText, { color: colors.textLight }]}>
                No active trips. Create a new trip to get started!
              </Text>
              <Link href="/trips/new" asChild>
                <TouchableOpacity style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}>
                  <Text style={styles.emptyStateButtonText}>Create Trip</Text>
                </TouchableOpacity>
              </Link>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.tripsScrollContent}
            >
              {activeTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </ScrollView>
          )}
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Expenses</Text>
            <Link href="/expenses" asChild>
              <TouchableOpacity style={styles.viewAll}>
                <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
                <ArrowRight size={16} color={colors.primary} />
              </TouchableOpacity>
            </Link>
          </View>
          
          {recentExpenses.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.cardAlt }]}>
              <Receipt size={40} color={colors.textLight} />
              <Text style={[styles.emptyStateText, { color: colors.textLight }]}>
                No recent expenses recorded.
              </Text>
              <Link href="/add-expense" asChild>
                <TouchableOpacity style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}>
                  <Text style={styles.emptyStateButtonText}>Add Expense</Text>
                </TouchableOpacity>
              </Link>
            </View>
          ) : (
            <View style={styles.expensesList}>
              {recentExpenses.map((expense) => (
                <ExpenseListItem key={expense.id} expense={expense} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  greeting: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    marginBottom: 4,
  },
  subGreeting: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  profilePic: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  profileInitial: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
  },
  overviewCard: {
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  overviewTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  overviewAmount: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 32,
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
  },
  actionButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 6,
  },
  section: {
    marginTop: 8,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginRight: 4,
  },
  tripsScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  expensesList: {
    paddingHorizontal: 24,
  },
  emptyState: {
    margin: 24,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  emptyStateButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
  },
  emptyStateButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
});