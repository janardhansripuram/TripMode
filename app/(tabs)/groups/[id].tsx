import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Users, Receipt, DollarSign, UserPlus, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { THEME_COLORS } from '@/constants/colors';
import { getGroupById, getGroupMembers, getGroupExpenses, getGroupSummary, deleteGroup } from '@/services/groupService';
import { GroupData, GroupMemberData, ExpenseData, GroupSummary } from '@/types';
import { formatCurrency } from '@/utils/formatters';

export default function GroupDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const colors = THEME_COLORS[theme];
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<GroupData | null>(null);
  const [members, setMembers] = useState<GroupMemberData[]>([]);
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [summary, setSummary] = useState<GroupSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    loadGroupData();
  }, [id]);
  
  const loadGroupData = async () => {
    if (!id) {
      router.back();
      return;
    }
    
    try {
      const [groupData, membersData, expensesData, summaryData] = await Promise.all([
        getGroupById(id),
        getGroupMembers(id),
        getGroupExpenses(id),
        getGroupSummary(id)
      ]);
      
      setGroup(groupData);
      setMembers(membersData);
      setExpenses(expensesData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading group data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteGroup = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      await deleteGroup(id);
      router.back();
    } catch (error) {
      console.error('Error deleting group:', error);
      setIsDeleting(false);
    }
  };
  
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  if (!group) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Group not found</Text>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.card }]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.deleteButton, { backgroundColor: colors.errorLight }]}
          onPress={handleDeleteGroup}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator size="small\" color={colors.error} />
          ) : (
            <Trash2 size={20} color={colors.error} />
          )}
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.groupInfo}>
          <Text style={[styles.groupName, { color: colors.text }]}>{group.name}</Text>
          <Text style={[styles.groupCurrency, { color: colors.textLight }]}>
            Currency: {group.currency}
          </Text>
        </View>
        
        <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
          <View style={styles.statItem}>
            <Users size={20} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{members.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textLight }]}>Members</Text>
          </View>
          
          <View style={styles.statItem}>
            <Receipt size={20} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{expenses.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textLight }]}>Expenses</Text>
          </View>
          
          <View style={styles.statItem}>
            <DollarSign size={20} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatCurrency(summary?.total_expenses || 0, group.currency)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textLight }]}>Total</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Members</Text>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: colors.primaryLight }]}
              onPress={() => router.push(`/groups/${id}/add-member`)}
            >
              <UserPlus size={16} color={colors.primary} />
              <Text style={[styles.addButtonText, { color: colors.primary }]}>Add</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.membersList}>
            {members.map((member) => (
              <View 
                key={member.id} 
                style={[styles.memberCard, { backgroundColor: colors.card }]}
              >
                <View style={styles.memberInfo}>
                  {member.user?.avatar_url ? (
                    <Image 
                      source={{ uri: member.user.avatar_url }}
                      style={styles.memberAvatar}
                    />
                  ) : (
                    <View style={[styles.memberInitial, { backgroundColor: colors.primaryLight }]}>
                      <Text style={[styles.initialText, { color: colors.primary }]}>
                        {member.user?.display_name?.[0] || 'U'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.memberDetails}>
                    <Text style={[styles.memberName, { color: colors.text }]}>
                      {member.user?.display_name || 'Unknown User'}
                    </Text>
                    <Text style={[styles.memberEmail, { color: colors.textLight }]}>
                      {member.user?.email || 'No email'}
                    </Text>
                  </View>
                </View>
                
                {summary?.member_balances.find(b => b.user_id === member.user_id)?.balance !== 0 && (
                  <Text 
                    style={[
                      styles.memberBalance,
                      { 
                        color: summary?.member_balances.find(b => b.user_id === member.user_id)?.balance || 0 > 0 
                          ? colors.success 
                          : colors.error 
                      }
                    ]}
                  >
                    {formatCurrency(
                      summary?.member_balances.find(b => b.user_id === member.user_id)?.balance || 0,
                      group.currency
                    )}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Expenses</Text>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: colors.primaryLight }]}
              onPress={() => router.push(`/groups/${id}/add-expense`)}
            >
              <Receipt size={16} color={colors.primary} />
              <Text style={[styles.addButtonText, { color: colors.primary }]}>Add</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.expensesList}>
            {expenses.slice(0, 5).map((expense) => (
              <TouchableOpacity
                key={expense.id}
                style={[styles.expenseCard, { backgroundColor: colors.card }]}
                onPress={() => router.push(`/groups/${id}/expenses/${expense.id}`)}
              >
                <View style={styles.expenseInfo}>
                  <Text style={[styles.expenseDescription, { color: colors.text }]}>
                    {expense.description}
                  </Text>
                  <Text style={[styles.expensePaidBy, { color: colors.textLight }]}>
                    Paid by {expense.paid_by_user?.display_name || 'Unknown'}
                  </Text>
                </View>
                <Text style={[styles.expenseAmount, { color: colors.text }]}>
                  {formatCurrency(expense.amount, group.currency)}
                </Text>
              </TouchableOpacity>
            ))}
            
            {expenses.length > 5 && (
              <TouchableOpacity
                style={[styles.viewAllButton, { backgroundColor: colors.card }]}
                onPress={() => router.push(`/groups/${id}/expenses`)}
              >
                <Text style={[styles.viewAllText, { color: colors.primary }]}>
                  View All Expenses
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {summary?.settlements_needed.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Settlements Needed</Text>
            
            <View style={styles.settlementsList}>
              {summary.settlements_needed.map((settlement, index) => (
                <View 
                  key={index}
                  style={[styles.settlementCard, { backgroundColor: colors.card }]}
                >
                  <View style={styles.settlementInfo}>
                    <Text style={[styles.settlementText, { color: colors.text }]}>
                      {settlement.payer_name} owes {settlement.receiver_name}
                    </Text>
                    <Text style={[styles.settlementAmount, { color: colors.primary }]}>
                      {formatCurrency(settlement.amount, group.currency)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  groupInfo: {
    marginBottom: 24,
  },
  groupName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    marginBottom: 4,
  },
  groupCurrency: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    marginVertical: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  section: {
    marginBottom: 32,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 4,
  },
  membersList: {
    gap: 12,
  },
  memberCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  memberInitial: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  memberDetails: {
    marginLeft: 12,
  },
  memberName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginBottom: 2,
  },
  memberEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  memberBalance: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  expensesList: {
    gap: 12,
  },
  expenseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginBottom: 4,
  },
  expensePaidBy: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  expenseAmount: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginLeft: 16,
  },
  viewAllButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewAllText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  settlementsList: {
    gap: 12,
  },
  settlementCard: {
    padding: 16,
    borderRadius: 12,
  },
  settlementInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settlementText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  settlementAmount: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginLeft: 16,
  },
});