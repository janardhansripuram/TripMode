import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, Edit, Trash2, PlusCircle, Map, Calendar, DollarSign } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { THEME_COLORS } from '@/constants/colors';
import { fetchTripById, fetchTripExpenses, deleteTrip } from '@/services/expenseService';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import ExpenseListItem from '@/components/ExpenseListItem';
import { TripData, ExpenseData } from '@/types';

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const colors = THEME_COLORS[theme];
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<TripData | null>(null);
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    if (!id) {
      router.back();
      return;
    }
    
    const loadTripData = async () => {
      setLoading(true);
      try {
        const [tripData, expensesData] = await Promise.all([
          fetchTripById(id),
          fetchTripExpenses(id)
        ]);
        
        setTrip(tripData);
        setExpenses(expensesData);
      } catch (error) {
        console.error('Error loading trip details:', error);
        Alert.alert('Error', 'Failed to load trip details');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    
    loadTripData();
  }, [id]);
  
  const handleDeleteTrip = () => {
    Alert.alert(
      'Delete Trip',
      'Are you sure you want to delete this trip? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteTrip(id);
              router.back();
            } catch (error) {
              console.error('Error deleting trip:', error);
              Alert.alert('Error', 'Failed to delete trip');
              setIsDeleting(false);
            }
          }
        },
      ]
    );
  };
  
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  if (!trip) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Trip not found</Text>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const budgetRemaining = trip.budget - totalSpent;
  const budgetPercentage = trip.budget > 0 ? Math.min(100, (totalSpent / trip.budget) * 100) : 0;
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.closeButton, { backgroundColor: colors.card }]}
          onPress={() => router.back()}
        >
          <X size={20} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.card }]}
            onPress={() => router.push(`/trips/edit/${id}`)}
          >
            <Edit size={20} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.errorLight }]}
            onPress={handleDeleteTrip}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={colors.error} />
            ) : (
              <Trash2 size={20} color={colors.error} />
            )}
          </TouchableOpacity>
        </View>
      </View>
      
      <Image
        source={{ uri: trip.imageUrl || 'https://images.pexels.com/photos/3935702/pexels-photo-3935702.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
        style={styles.coverImage}
      />
      
      <View style={styles.content}>
        <View style={styles.tripInfo}>
          <Text style={[styles.tripName, { color: colors.text }]}>{trip.name}</Text>
          <View style={styles.tripMeta}>
            <View style={styles.metaItem}>
              <Map size={16} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.text }]}>{trip.destination}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Calendar size={16} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.text }]}>
                {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={[styles.budgetCard, { backgroundColor: colors.card }]}>
          <View style={styles.budgetHeader}>
            <Text style={[styles.budgetTitle, { color: colors.text }]}>Budget</Text>
            <Text style={[styles.budgetAmount, { color: colors.text }]}>
              {formatCurrency(trip.budget)}
            </Text>
          </View>
          
          <View style={[styles.progressContainer, { backgroundColor: colors.cardAlt }]}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  backgroundColor: budgetPercentage > 90 ? colors.error : colors.primary,
                  width: `${budgetPercentage}%` 
                }
              ]} 
            />
          </View>
          
          <View style={styles.budgetStats}>
            <View style={styles.budgetStat}>
              <Text style={[styles.budgetStatLabel, { color: colors.textLight }]}>Spent</Text>
              <Text style={[styles.budgetStatValue, { color: colors.text }]}>
                {formatCurrency(totalSpent)}
              </Text>
            </View>
            
            <View style={styles.budgetStat}>
              <Text style={[styles.budgetStatLabel, { color: colors.textLight }]}>Remaining</Text>
              <Text 
                style={[
                  styles.budgetStatValue, 
                  { 
                    color: budgetRemaining < 0 ? colors.error : colors.success 
                  }
                ]}
              >
                {formatCurrency(budgetRemaining)}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.expensesSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Expenses</Text>
            <TouchableOpacity 
              style={styles.addExpenseButton}
              onPress={() => router.push(`/add-expense?tripId=${id}`)}
            >
              <PlusCircle size={20} color={colors.primary} />
              <Text style={[styles.addExpenseText, { color: colors.primary }]}>Add</Text>
            </TouchableOpacity>
          </View>
          
          {expenses.length === 0 ? (
            <View style={[styles.emptyExpenses, { backgroundColor: colors.cardAlt }]}>
              <DollarSign size={40} color={colors.textLight} />
              <Text style={[styles.emptyExpensesText, { color: colors.textLight }]}>
                No expenses yet
              </Text>
              <TouchableOpacity 
                style={[styles.addFirstExpenseButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push(`/add-expense?tripId=${id}`)}
              >
                <Text style={styles.addFirstExpenseText}>Add First Expense</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={expenses}
              keyExtractor={item => item.id}
              renderItem={({ item }) => <ExpenseListItem expense={item} />}
              contentContainerStyle={styles.expensesList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 60,
    left: 24,
    right: 24,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  coverImage: {
    width: '100%',
    height: 240,
  },
  content: {
    flex: 1,
    marginTop: -40,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: 'white', // This will be overridden by the FlatList
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  tripInfo: {
    marginBottom: 24,
  },
  tripName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    marginBottom: 8,
  },
  tripMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  metaText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 6,
  },
  budgetCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  budgetTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
  },
  budgetAmount: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
  },
  progressContainer: {
    height: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  budgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetStat: {},
  budgetStatLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 4,
  },
  budgetStatValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  expensesSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
  },
  addExpenseButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addExpenseText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 4,
  },
  emptyExpenses: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyExpensesText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  addFirstExpenseButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addFirstExpenseText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  expensesList: {
    paddingBottom: 100,
  },
});