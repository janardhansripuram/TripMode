export interface TripData {
  id: string;
  name: string;
  destination: string;
  startDate: any;
  endDate: any;
  budget: number;
  imageUrl?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseData {
  id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  date: any;
  notes?: string;
  receiptImage?: string;
  tripId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StatsByCategory {
  category: string;
  amount: number;
}

export interface StatsByMonth {
  month: string;
  amount: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  defaultCurrency: string;
  createdAt: string;
}