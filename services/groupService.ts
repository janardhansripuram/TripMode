import { createClient } from '@supabase/supabase-js';
import { GroupData, GroupMemberData, ExpenseData, ExpenseShareData, SettlementData, GroupSummary } from '@/types';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

// Group Management
export const createGroup = async (name: string, currency: string = 'USD', default_split_method: string = 'equal'): Promise<GroupData> => {
  const { data, error } = await supabase
    .from('groups')
    .insert({
      name,
      currency,
      default_split_method
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getGroups = async (): Promise<GroupData[]> => {
  const { data, error } = await supabase
    .from('groups')
    .select(`
      *,
      group_members (
        user_id,
        status,
        users (
          email,
          display_name,
          avatar_url
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getGroupById = async (groupId: string): Promise<GroupData> => {
  const { data, error } = await supabase
    .from('groups')
    .select(`
      *,
      group_members (
        user_id,
        status,
        users (
          email,
          display_name,
          avatar_url
        )
      )
    `)
    .eq('id', groupId)
    .single();

  if (error) throw error;
  return data;
};

export const updateGroup = async (groupId: string, updates: Partial<GroupData>): Promise<void> => {
  const { error } = await supabase
    .from('groups')
    .update(updates)
    .eq('id', groupId);

  if (error) throw error;
};

// Group Members
export const addGroupMember = async (groupId: string, userEmail: string): Promise<void> => {
  // First, get the user ID from the email
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', userEmail)
    .single();

  if (userError) throw userError;

  const { error } = await supabase
    .from('group_members')
    .insert({
      group_id: groupId,
      user_id: userData.id
    });

  if (error) throw error;
};

export const removeGroupMember = async (groupId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('group_members')
    .update({ status: 'inactive' })
    .eq('group_id', groupId)
    .eq('user_id', userId);

  if (error) throw error;
};

// Expenses
export const createExpense = async (
  groupId: string,
  description: string,
  amount: number,
  paidBy: string,
  category: string,
  splitType: string = 'equal',
  date: string = new Date().toISOString(),
  receiptUrl?: string
): Promise<ExpenseData> => {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      group_id: groupId,
      description,
      amount,
      paid_by: paidBy,
      category,
      split_type: splitType,
      date,
      receipt_url: receiptUrl
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getGroupExpenses = async (groupId: string): Promise<ExpenseData[]> => {
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      *,
      paid_by_user:users!paid_by (
        email,
        display_name,
        avatar_url
      ),
      expense_shares (
        *,
        user:users (
          email,
          display_name,
          avatar_url
        )
      )
    `)
    .eq('group_id', groupId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data;
};

export const updateExpense = async (expenseId: string, updates: Partial<ExpenseData>): Promise<void> => {
  const { error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', expenseId);

  if (error) throw error;
};

export const deleteExpense = async (expenseId: string): Promise<void> => {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId);

  if (error) throw error;
};

// Settlements
export const createSettlement = async (
  groupId: string,
  payerId: string,
  receiverId: string,
  amount: number
): Promise<SettlementData> => {
  const { data, error } = await supabase
    .from('settlements')
    .insert({
      group_id: groupId,
      payer_id: payerId,
      receiver_id: receiverId,
      amount
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const markSettlementComplete = async (settlementId: string): Promise<void> => {
  const { error } = await supabase
    .from('settlements')
    .update({
      status: 'completed',
      settled_at: new Date().toISOString()
    })
    .eq('id', settlementId);

  if (error) throw error;
};

// Group Summary
export const getGroupSummary = async (groupId: string): Promise<GroupSummary> => {
  // Get total expenses
  const { data: expensesData, error: expensesError } = await supabase
    .from('expenses')
    .select('amount, category')
    .eq('group_id', groupId);

  if (expensesError) throw expensesError;

  // Calculate total and category breakdown
  const total_expenses = expensesData.reduce((sum, exp) => sum + exp.amount, 0);
  const categories = expensesData.reduce((acc, exp) => {
    if (!acc[exp.category]) {
      acc[exp.category] = 0;
    }
    acc[exp.category] += exp.amount;
    return acc;
  }, {} as Record<string, number>);

  // Get member balances
  const { data: sharesData, error: sharesError } = await supabase
    .from('expense_shares')
    .select(`
      amount,
      user:users (
        id,
        display_name
      )
    `)
    .eq('status', 'pending');

  if (sharesError) throw sharesError;

  // Calculate member balances
  const balances = sharesData.reduce((acc, share) => {
    const userId = share.user.id;
    if (!acc[userId]) {
      acc[userId] = {
        user_id: userId,
        display_name: share.user.display_name,
        balance: 0
      };
    }
    acc[userId].balance += share.amount;
    return acc;
  }, {} as Record<string, { user_id: string; display_name: string; balance: number }>);

  // Calculate settlements needed
  const settlements_needed = calculateSettlements(Object.values(balances));

  return {
    total_expenses,
    member_balances: Object.values(balances),
    category_breakdown: Object.entries(categories).map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / total_expenses) * 100
    })),
    settlements_needed
  };
};

// Helper function to calculate optimal settlements
function calculateSettlements(balances: { user_id: string; display_name: string; balance: number }[]) {
  const settlements = [];
  const debtors = balances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);
  const creditors = balances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance);

  while (debtors.length > 0 && creditors.length > 0) {
    const debtor = debtors[0];
    const creditor = creditors[0];
    const amount = Math.min(debtor.balance, -creditor.balance);

    if (amount > 0) {
      settlements.push({
        payer_id: debtor.user_id,
        payer_name: debtor.display_name,
        receiver_id: creditor.user_id,
        receiver_name: creditor.display_name,
        amount: Number(amount.toFixed(2))
      });
    }

    debtor.balance -= amount;
    creditor.balance += amount;

    if (Math.abs(debtor.balance) < 0.01) debtors.shift();
    if (Math.abs(creditor.balance) < 0.01) creditors.shift();
  }

  return settlements;
}