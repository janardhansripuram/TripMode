import { db, auth } from '@/config/firebase';
import { collection, addDoc, getDocs, getDoc, doc, query, where, orderBy, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { GroupData, GroupMemberData, ExpenseData, ExpenseShareData, SettlementData, GroupSummary } from '@/types';

// Group Management
export const createGroup = async (name: string, currency: string = 'USD', default_split_method: string = 'equal'): Promise<GroupData> => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('User not authenticated');

  const groupData = {
    name,
    currency,
    default_split_method,
    created_at: Timestamp.now().toDate().toISOString(),
    updated_at: Timestamp.now().toDate().toISOString(),
  };

  const groupRef = await addDoc(collection(db, 'groups'), groupData);
  
  // Add creator as first member
  await addDoc(collection(db, 'group_members'), {
    group_id: groupRef.id,
    user_id: userId,
    joined_at: Timestamp.now().toDate().toISOString(),
    status: 'active'
  });

  return { id: groupRef.id, ...groupData };
};

export const getGroups = async (): Promise<GroupData[]> => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('User not authenticated');

  const membershipQuery = query(
    collection(db, 'group_members'),
    where('user_id', '==', userId),
    where('status', '==', 'active')
  );

  const memberships = await getDocs(membershipQuery);
  const groupIds = memberships.docs.map(doc => doc.data().group_id);

  const groups: GroupData[] = [];
  for (const groupId of groupIds) {
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    if (groupDoc.exists()) {
      groups.push({ id: groupDoc.id, ...groupDoc.data() } as GroupData);
    }
  }

  return groups;
};

export const getGroupById = async (groupId: string): Promise<GroupData | null> => {
  const groupDoc = await getDoc(doc(db, 'groups', groupId));
  if (!groupDoc.exists()) return null;
  return { id: groupDoc.id, ...groupDoc.data() } as GroupData;
};

export const updateGroup = async (groupId: string, data: Partial<GroupData>): Promise<void> => {
  await updateDoc(doc(db, 'groups', groupId), {
    ...data,
    updated_at: Timestamp.now().toDate().toISOString()
  });
};

export const deleteGroup = async (groupId: string): Promise<void> => {
  await deleteDoc(doc(db, 'groups', groupId));
};

// Group Members Management
export const addGroupMember = async (groupId: string, userId: string): Promise<void> => {
  await addDoc(collection(db, 'group_members'), {
    group_id: groupId,
    user_id: userId,
    joined_at: Timestamp.now().toDate().toISOString(),
    status: 'active'
  });
};

export const removeGroupMember = async (groupId: string, userId: string): Promise<void> => {
  const membershipQuery = query(
    collection(db, 'group_members'),
    where('group_id', '==', groupId),
    where('user_id', '==', userId)
  );

  const memberships = await getDocs(membershipQuery);
  memberships.forEach(async (doc) => {
    await updateDoc(doc.ref, { status: 'inactive' });
  });
};

export const getGroupMembers = async (groupId: string): Promise<GroupMemberData[]> => {
  const membershipQuery = query(
    collection(db, 'group_members'),
    where('group_id', '==', groupId),
    where('status', '==', 'active')
  );

  const memberships = await getDocs(membershipQuery);
  return memberships.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as GroupMemberData[];
};

// Group Expenses Management
export const addGroupExpense = async (
  groupId: string,
  expenseData: Omit<ExpenseData, 'id' | 'group_id' | 'created_at' | 'updated_at'>
): Promise<string> => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('User not authenticated');

  const expenseRef = await addDoc(collection(db, 'expenses'), {
    ...expenseData,
    group_id: groupId,
    created_at: Timestamp.now().toDate().toISOString(),
    updated_at: Timestamp.now().toDate().toISOString()
  });

  return expenseRef.id;
};

export const getGroupExpenses = async (groupId: string): Promise<ExpenseData[]> => {
  const expensesQuery = query(
    collection(db, 'expenses'),
    where('group_id', '==', groupId),
    orderBy('date', 'desc')
  );

  const expenses = await getDocs(expensesQuery);
  return expenses.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ExpenseData[];
};

export const updateGroupExpense = async (
  expenseId: string,
  data: Partial<ExpenseData>
): Promise<void> => {
  await updateDoc(doc(db, 'expenses', expenseId), {
    ...data,
    updated_at: Timestamp.now().toDate().toISOString()
  });
};

export const deleteGroupExpense = async (expenseId: string): Promise<void> => {
  await deleteDoc(doc(db, 'expenses', expenseId));
};

// Expense Shares Management
export const addExpenseShare = async (
  expenseId: string,
  shareData: Omit<ExpenseShareData, 'id' | 'expense_id'>
): Promise<void> => {
  await addDoc(collection(db, 'expense_shares'), {
    ...shareData,
    expense_id: expenseId
  });
};

export const getExpenseShares = async (expenseId: string): Promise<ExpenseShareData[]> => {
  const sharesQuery = query(
    collection(db, 'expense_shares'),
    where('expense_id', '==', expenseId)
  );

  const shares = await getDocs(sharesQuery);
  return shares.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ExpenseShareData[];
};

export const updateExpenseShare = async (
  shareId: string,
  data: Partial<ExpenseShareData>
): Promise<void> => {
  await updateDoc(doc(db, 'expense_shares', shareId), data);
};

// Settlements Management
export const createSettlement = async (
  groupId: string,
  settlementData: Omit<SettlementData, 'id' | 'group_id' | 'created_at'>
): Promise<void> => {
  await addDoc(collection(db, 'settlements'), {
    ...settlementData,
    group_id: groupId,
    created_at: Timestamp.now().toDate().toISOString()
  });
};

export const getGroupSettlements = async (groupId: string): Promise<SettlementData[]> => {
  const settlementsQuery = query(
    collection(db, 'settlements'),
    where('group_id', '==', groupId),
    orderBy('created_at', 'desc')
  );

  const settlements = await getDocs(settlementsQuery);
  return settlements.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as SettlementData[];
};

export const updateSettlement = async (
  settlementId: string,
  data: Partial<SettlementData>
): Promise<void> => {
  await updateDoc(doc(db, 'settlements', settlementId), data);
};

// Group Summary and Statistics
export const getGroupSummary = async (groupId: string): Promise<GroupSummary> => {
  const [expenses, members] = await Promise.all([
    getGroupExpenses(groupId),
    getGroupMembers(groupId)
  ]);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Calculate member balances
  const memberBalances = new Map<string, number>();
  members.forEach(member => memberBalances.set(member.user_id, 0));

  for (const expense of expenses) {
    const shares = await getExpenseShares(expense.id);
    shares.forEach(share => {
      const currentBalance = memberBalances.get(share.user_id) || 0;
      memberBalances.set(share.user_id, currentBalance + share.amount);
    });
  }

  // Calculate category breakdown
  const categoryAmounts = new Map<string, number>();
  expenses.forEach(expense => {
    const currentAmount = categoryAmounts.get(expense.category) || 0;
    categoryAmounts.set(expense.category, currentAmount + expense.amount);
  });

  const categoryBreakdown = Array.from(categoryAmounts.entries()).map(([category, amount]) => ({
    category,
    amount,
    percentage: (amount / totalExpenses) * 100
  }));

  // Calculate settlements needed
  const settlements: {
    payer_id: string;
    payer_name: string;
    receiver_id: string;
    receiver_name: string;
    amount: number;
  }[] = [];

  // Add settlement calculation logic here
  // This is a simplified version - you might want to implement a more sophisticated algorithm
  const sortedBalances = Array.from(memberBalances.entries())
    .sort((a, b) => a[1] - b[1]);

  let i = 0;
  let j = sortedBalances.length - 1;

  while (i < j) {
    const [payerId, payerBalance] = sortedBalances[i];
    const [receiverId, receiverBalance] = sortedBalances[j];

    if (Math.abs(payerBalance) < 0.01) {
      i++;
      continue;
    }

    if (Math.abs(receiverBalance) < 0.01) {
      j--;
      continue;
    }

    const amount = Math.min(Math.abs(payerBalance), receiverBalance);
    if (amount > 0) {
      settlements.push({
        payer_id: payerId,
        payer_name: members.find(m => m.user_id === payerId)?.user?.display_name || 'Unknown',
        receiver_id: receiverId,
        receiver_name: members.find(m => m.user_id === receiverId)?.user?.display_name || 'Unknown',
        amount
      });
    }

    sortedBalances[i] = [payerId, payerBalance + amount];
    sortedBalances[j] = [receiverId, receiverBalance - amount];
  }

  return {
    total_expenses: totalExpenses,
    member_balances: Array.from(memberBalances.entries()).map(([user_id, balance]) => ({
      user_id,
      display_name: members.find(m => m.user_id === user_id)?.user?.display_name || 'Unknown',
      balance
    })),
    category_breakdown: categoryBreakdown,
    settlements_needed: settlements
  };
};