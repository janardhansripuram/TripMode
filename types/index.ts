export interface GroupData {
  id: string;
  name: string;
  currency: string;
  default_split_method: 'equal' | 'percentage' | 'custom';
  created_at: string;
  updated_at: string;
}

export interface GroupMemberData {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
  status: 'active' | 'inactive';
  user?: {
    email: string;
    display_name: string;
    avatar_url?: string;
  };
}

export interface ExpenseData {
  id: string;
  group_id: string;
  description: string;
  amount: number;
  date: string;
  paid_by: string;
  category: string;
  split_type: 'equal' | 'percentage' | 'custom';
  receipt_url?: string;
  created_at: string;
  updated_at: string;
  paid_by_user?: {
    email: string;
    display_name: string;
    avatar_url?: string;
  };
}

export interface ExpenseShareData {
  id: string;
  expense_id: string;
  user_id: string;
  amount: number;
  percentage?: number;
  status: 'pending' | 'settled';
  settled_at?: string;
  user?: {
    email: string;
    display_name: string;
    avatar_url?: string;
  };
}

export interface SettlementData {
  id: string;
  group_id: string;
  payer_id: string;
  receiver_id: string;
  amount: number;
  status: 'pending' | 'completed';
  settled_at?: string;
  created_at: string;
  payer?: {
    email: string;
    display_name: string;
    avatar_url?: string;
  };
  receiver?: {
    email: string;
    display_name: string;
    avatar_url?: string;
  };
}

export interface GroupSummary {
  total_expenses: number;
  member_balances: {
    user_id: string;
    display_name: string;
    balance: number;
  }[];
  category_breakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  settlements_needed: {
    payer_id: string;
    payer_name: string;
    receiver_id: string;
    receiver_name: string;
    amount: number;
  }[];
}

export interface UserProfile {
  uid: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  created_at: string;
}