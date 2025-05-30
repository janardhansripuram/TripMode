import { collection, addDoc, getDocs, getDoc, doc, query, where, orderBy, limit, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '@/config/firebase';
import { ExpenseData, TripData, StatsByCategory, StatsByMonth } from '@/types';

// TRIPS
export const fetchTrips = async (): Promise<TripData[]> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    const tripsRef = collection(db, 'trips');
    const q = query(
      tripsRef, 
      where('userId', '==', userId),
      orderBy('startDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const trips: TripData[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      trips.push({
        id: doc.id,
        ...data,
        startDate: data.startDate.toDate().toISOString(),
        endDate: data.endDate.toDate().toISOString(),
        createdAt: data.createdAt.toDate().toISOString(),
        updatedAt: data.updatedAt.toDate().toISOString(),
      } as TripData);
    });
    
    return trips;
  } catch (error) {
    console.error('Error fetching trips:', error);
    throw error;
  }
};

export const fetchActiveTrips = async (): Promise<TripData[]> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const tripsRef = collection(db, 'trips');
    const now = Timestamp.now();
    const q = query(
      tripsRef, 
      where('userId', '==', userId),
      where('endDate', '>=', now)
    );

    const querySnapshot = await getDocs(q);
    const trips: TripData[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      trips.push({
        id: doc.id,
        ...data,
        startDate: data.startDate.toDate().toISOString(),
        endDate: data.endDate.toDate().toISOString(),
        createdAt: data.createdAt.toDate().toISOString(),
        updatedAt: data.updatedAt.toDate().toISOString(),
      } as TripData);
    });

    return trips;
  } catch (error) {
    console.error('Error fetching active trips:', error);
    throw error;
  }
};

export const fetchTripById = async (tripId: string): Promise<TripData | null> => {
  try {
    const tripRef = doc(db, 'trips', tripId);
    const tripDoc = await getDoc(tripRef);

    if (!tripDoc.exists()) return null;

    const data = tripDoc.data();
    return {
      id: tripDoc.id,
      ...data,
      startDate: data.startDate.toDate().toISOString(),
      endDate: data.endDate.toDate().toISOString(),
      createdAt: data.createdAt.toDate().toISOString(),
      updatedAt: data.updatedAt.toDate().toISOString(),
    } as TripData;
  } catch (error) {
    console.error('Error fetching trip:', error);
    throw error;
  }
};

export const addTrip = async (tripData: Omit<TripData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    // If there's an image URL from image picker, upload it to Firebase Storage
    let imageUrl = tripData.imageUrl;
    if (imageUrl && imageUrl.startsWith('file://')) {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const imageRef = ref(storage, `trip-images/${Date.now()}`);
      await uploadBytes(imageRef, blob);
      imageUrl = await getDownloadURL(imageRef);
    }

    const docRef = await addDoc(collection(db, 'trips'), {
      ...tripData,
      imageUrl,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    return docRef.id;
  } catch (error) {
    console.error('Error adding trip:', error);
    throw error;
  }
};

export const updateTrip = async (tripId: string, tripData: Partial<TripData>): Promise<void> => {
  try {
    const tripRef = doc(db, 'trips', tripId);
    
    // Handle image upload if there's a new image
    let imageUrl = tripData.imageUrl;
    if (imageUrl && imageUrl.startsWith('file://')) {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const imageRef = ref(storage, `trip-images/${Date.now()}`);
      await uploadBytes(imageRef, blob);
      imageUrl = await getDownloadURL(imageRef);
    }
    
    await updateDoc(tripRef, {
      ...tripData,
      imageUrl: imageUrl || tripData.imageUrl,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating trip:', error);
    throw error;
  }
};

export const deleteTrip = async (tripId: string): Promise<void> => {
  try {
    const tripRef = doc(db, 'trips', tripId);
    await deleteDoc(tripRef);
  } catch (error) {
    console.error('Error deleting trip:', error);
    throw error;
  }
};

// EXPENSES
export const fetchExpenses = async (): Promise<ExpenseData[]> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const expensesRef = collection(db, 'expenses');
    const q = query(
      expensesRef,
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const expenses: ExpenseData[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      expenses.push({
        id: doc.id,
        ...data,
        date: data.date.toDate().toISOString(),
        createdAt: data.createdAt.toDate().toISOString(),
        updatedAt: data.updatedAt.toDate().toISOString(),
      } as ExpenseData);
    });

    return expenses;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

export const fetchRecentExpenses = async (): Promise<ExpenseData[]> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const expensesRef = collection(db, 'expenses');
    const q = query(
      expensesRef,
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(5)
    );

    const querySnapshot = await getDocs(q);
    const expenses: ExpenseData[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      expenses.push({
        id: doc.id,
        ...data,
        date: data.date.toDate().toISOString(),
        createdAt: data.createdAt.toDate().toISOString(),
        updatedAt: data.updatedAt.toDate().toISOString(),
      } as ExpenseData);
    });

    return expenses;
  } catch (error) {
    console.error('Error fetching recent expenses:', error);
    throw error;
  }
};

export const fetchTripExpenses = async (tripId: string): Promise<ExpenseData[]> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const expensesRef = collection(db, 'expenses');
    const q = query(
      expensesRef,
      where('userId', '==', userId),
      where('tripId', '==', tripId),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const expenses: ExpenseData[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      expenses.push({
        id: doc.id,
        ...data,
        date: data.date.toDate().toISOString(),
        createdAt: data.createdAt.toDate().toISOString(),
        updatedAt: data.updatedAt.toDate().toISOString(),
      } as ExpenseData);
    });

    return expenses;
  } catch (error) {
    console.error('Error fetching trip expenses:', error);
    throw error;
  }
};

export const addExpense = async (expenseData: Omit<ExpenseData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    // Handle receipt image upload if present
    let receiptUrl = expenseData.receiptImage;
    if (receiptUrl && receiptUrl.startsWith('file://')) {
      const response = await fetch(receiptUrl);
      const blob = await response.blob();
      const imageRef = ref(storage, `receipts/${Date.now()}`);
      await uploadBytes(imageRef, blob);
      receiptUrl = await getDownloadURL(imageRef);
    }

    const docRef = await addDoc(collection(db, 'expenses'), {
      ...expenseData,
      receiptImage: receiptUrl,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    return docRef.id;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

export const updateExpense = async (expenseId: string, expenseData: Partial<ExpenseData>): Promise<void> => {
  try {
    const expenseRef = doc(db, 'expenses', expenseId);
    
    // Handle receipt image upload if there's a new image
    let receiptUrl = expenseData.receiptImage;
    if (receiptUrl && receiptUrl.startsWith('file://')) {
      const response = await fetch(receiptUrl);
      const blob = await response.blob();
      const imageRef = ref(storage, `receipts/${Date.now()}`);
      await uploadBytes(imageRef, blob);
      receiptUrl = await getDownloadURL(imageRef);
    }
    
    await updateDoc(expenseRef, {
      ...expenseData,
      receiptImage: receiptUrl || expenseData.receiptImage,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

export const deleteExpense = async (expenseId: string): Promise<void> => {
  try {
    const expenseRef = doc(db, 'expenses', expenseId);
    await deleteDoc(expenseRef);
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

// STATISTICS
export const fetchTotalSpent = async (timeframe?: string): Promise<number> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const expensesRef = collection(db, 'expenses');
    let q = query(expensesRef, where('userId', '==', userId));

    if (timeframe) {
      const now = new Date();
      let startDate = Timestamp.fromDate(now);

      if (timeframe === 'week') {
        now.setDate(now.getDate() - 7);
        startDate = Timestamp.fromDate(now);
      } else if (timeframe === 'month') {
        now.setMonth(now.getMonth() - 1);
        startDate = Timestamp.fromDate(now);
      } else if (timeframe === 'year') {
        now.setFullYear(now.getFullYear() - 1);
        startDate = Timestamp.fromDate(now);
      }

      q = query(
        expensesRef,
        where('userId', '==', userId),
        where('date', '>=', startDate)
      );
    }

    const querySnapshot = await getDocs(q);
    const totalSpent = querySnapshot.docs.reduce((total, doc) => total + doc.data().amount, 0);

    return totalSpent;
  } catch (error) {
    console.error('Error fetching total spent:', error);
    throw error;
  }
};

export const fetchExpenseStats = async (groupBy: 'category' | 'month', timeframe?: string): Promise<StatsByCategory[] | StatsByMonth[]> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const expensesRef = collection(db, 'expenses');
    let q = query(expensesRef, where('userId', '==', userId));

    if (timeframe) {
      const now = new Date();
      let startDate = Timestamp.fromDate(now);

      if (timeframe === 'week') {
        now.setDate(now.getDate() - 7);
        startDate = Timestamp.fromDate(now);
      } else if (timeframe === 'month') {
        now.setMonth(now.getMonth() - 1);
        startDate = Timestamp.fromDate(now);
      } else if (timeframe === 'year') {
        now.setFullYear(now.getFullYear() - 1);
        startDate = Timestamp.fromDate(now);
      }

      q = query(
        expensesRef,
        where('userId', '==', userId),
        where('date', '>=', startDate)
      );
    }

    const querySnapshot = await getDocs(q);
    const expenses = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      date: doc.data().date.toDate()
    }));

    if (groupBy === 'category') {
      const categoryStats: Record<string, number> = {};
      expenses.forEach((expense) => {
        categoryStats[expense.category] = (categoryStats[expense.category] || 0) + expense.amount;
      });

      return Object.entries(categoryStats)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);
    } else {
      const monthStats: Record<string, number> = {};
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      expenses.forEach((expense) => {
        const monthName = months[expense.date.getMonth()];
        monthStats[monthName] = (monthStats[monthName] || 0) + expense.amount;
      });

      return Object.entries(monthStats)
        .map(([month, amount]) => ({ month, amount }))
        .sort((a, b) => months.indexOf(a.month) - months.indexOf(b.month));
    }
  } catch (error) {
    console.error('Error fetching expense stats:', error);
    throw error;
  }
};