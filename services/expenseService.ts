import { collection, addDoc, getDocs, getDoc, doc, query, where, orderBy, limit, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '@/config/firebase';
import { ExpenseData, TripData, StatsByCategory, StatsByMonth } from '@/types';

// Mock data for demonstration until Firebase connection is established
import { mockTrips, mockExpenses } from '@/utils/mockData';

// TRIPS

export const fetchTrips = async (): Promise<TripData[]> => {
  // Use mock data for now
  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     resolve(mockTrips);
  //   }, 500);
  // });
  
  // Actual implementation would be:
  
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
// export const fetchTrips = async (): Promise<TripData[]> => {
//   try {
//     const userId = auth.currentUser?.uid;
//     if (!userId) throw new Error("User not authenticated");

//     const tripsRef = collection(db, "trips");
//     const q = query(tripsRef, where("userId", "==", userId), orderBy("startDate", "desc"));

//     const querySnapshot = await getDocs(q);
   
//     const trips: TripData[] = querySnapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//       startDate: doc.data().startDate.toDate().toISOString(),
//       endDate: doc.data().endDate.toDate().toISOString(),
//     }));
// console.log("trips",trips);
//     return trips;
//   } catch (error) {
//     console.error("Error fetching trips:", error);
//     throw error;
//   }
// };

export const fetchActiveTrips = async (): Promise<TripData[]> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not authenticated");

    const tripsRef = collection(db, "trips");
    const q = query(tripsRef, where("userId", "==", userId), where("endDate", ">=", Timestamp.now()));
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
    console.log("trips",trips)
    return trips;
  } catch (error) {
    console.error("Error fetching active trips:", error);
    throw error;
  }
};


export const fetchTripById = async (tripId: string): Promise<TripData | null> => {
  // Use mock data for now
  return new Promise((resolve) => {
    const trip = mockTrips.find(t => t.id === tripId);
    
    setTimeout(() => {
      resolve(trip || null);
    }, 300);
  });
};

export const addTrip = async (tripData: Omit<TripData, "id" | "userId" | "createdAt" | "updatedAt">): Promise<string> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not authenticated");

    const docRef = await addDoc(collection(db, "trips"), {
      ...tripData,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    return docRef.id;
  } catch (error) {
    console.error("Error adding trip:", error);
    throw error;
  }
};

export const updateTrip = async (tripId: string, tripData: Partial<TripData>): Promise<void> => {
  try {
    const tripRef = doc(db, "trips", tripId);
    
    await updateDoc(tripRef, {
      ...tripData,
      updatedAt: Timestamp.now()
    });

    console.log(`Trip ${tripId} updated successfully!`);
  } catch (error) {
    console.error("Error updating trip:", error);
    throw error;
  }
};

export const deleteTrip = async (tripId: string): Promise<void> => {
  try {
    const tripRef = doc(db, "trips", tripId);
    await deleteDoc(tripRef);
    console.log(`Trip ${tripId} deleted successfully!`);
  } catch (error) {
    console.error("Error deleting trip:", error);
    throw error;
  }
};

// EXPENSES

export const fetchExpenses = async (): Promise<ExpenseData[]> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not authenticated");

    const expensesRef = collection(db, "expenses");
    const q = query(expensesRef, where("userId", "==", userId), orderBy("date", "desc"));

    const querySnapshot = await getDocs(q);
    const expenses: ExpenseData[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate().toISOString(),
    }));
console.log("expe",expenses);
    return expenses;
  } catch (error) {
    console.error("Error fetching expense:", error);
    throw error;
  }
};



export const fetchRecentExpenses = async (): Promise<ExpenseData[]> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not authenticated");

    const expensesRef = collection(db, "expenses");
    const q = query(expensesRef, where("userId", "==", userId), orderBy("date", "desc"), limit(5));

    const querySnapshot = await getDocs(q);
    const expenses: ExpenseData[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate().toISOString(),
    }));

    return expenses;
  } catch (error) {
    console.error("Error fetching recent expenses:", error);
    throw error;
  }
};

export const fetchTripExpenses = async (tripId: string): Promise<ExpenseData[]> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not authenticated");

    const expensesRef = collection(db, "expenses");
    const q = query(expensesRef, where("userId", "==", userId), where("tripId", "==", tripId));

    const querySnapshot = await getDocs(q);
    const expenses: ExpenseData[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate().toISOString(),
    }));

    return expenses;
  } catch (error) {
    console.error("Error fetching trip expenses:", error);
    throw error;
  }
};

export const fetchExpenseById = async (expenseId: string): Promise<ExpenseData | null> => {
  try {
    const expenseRef = doc(db, "expenses", expenseId);
    const docSnapshot = await getDoc(expenseRef);

    if (!docSnapshot.exists()) return null;

    return {
      id: docSnapshot.id,
      ...docSnapshot.data(),
      date: docSnapshot.data().date.toDate().toISOString(),
    } as ExpenseData;
  } catch (error) {
    console.error("Error fetching expense:", error);
    throw error;
  }
};

export const addExpense = async (expenseData: Omit<ExpenseData, "id" | "userId" | "createdAt" | "updatedAt">): Promise<string> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not authenticated");

    const docRef = await addDoc(collection(db, "expenses"), {
      ...expenseData,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    return docRef.id;
  } catch (error) {
    console.error("Error adding expense:", error);
    throw error;
  }
};

export const updateExpense = async (expenseId: string, expenseData: Partial<ExpenseData>): Promise<void> => {
  try {
    const expenseRef = doc(db, "expenses", expenseId);
    
    await updateDoc(expenseRef, {
      ...expenseData,
      updatedAt: Timestamp.now()
    });

    console.log(`Expense ${expenseId} updated successfully!`);
  } catch (error) {
    console.error("Error updating expense:", error);
    throw error;
  }
};

export const deleteExpense = async (expenseId: string): Promise<void> => {
  try {
    const expenseRef = doc(db, "expenses", expenseId);
    await deleteDoc(expenseRef);
    console.log(`Expense ${expenseId} deleted successfully!`);
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw error;
  }
};

// STATISTICS

export const fetchTotalSpent = async (timeframe?: string): Promise<number> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not authenticated");

    const expensesRef = collection(db, "expenses");
    let q = query(expensesRef, where("userId", "==", userId));

    // Apply timeframe filters
    if (timeframe) {
      const now = new Date();
      let startDate;

      if (timeframe === "week") {
        now.setDate(now.getDate() - 7);
        startDate = now;
      } else if (timeframe === "month") {
        now.setMonth(now.getMonth() - 1);
        startDate = now;
      } else if (timeframe === "year") {
        now.setFullYear(now.getFullYear() - 1);
        startDate = now;
      }

      if (startDate) {
        q = query(expensesRef, where("userId", "==", userId), where("date", ">=", startDate));
      }
    }

    const querySnapshot = await getDocs(q);
    const totalSpent = querySnapshot.docs.reduce((total, doc) => total + doc.data().amount, 0);

    return totalSpent;
  } catch (error) {
    console.error("Error fetching total spent:", error);
    throw error;
  }
};

export const fetchExpenseStats = async (groupBy: "category" | "month", timeframe?: string): Promise<StatsByCategory[] | StatsByMonth[]> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not authenticated");

    const expensesRef = collection(db, "expenses");
    let q = query(expensesRef, where("userId", "==", userId));

    // Apply timeframe filter
    if (timeframe) {
      const now = new Date();
      let startDate;

      if (timeframe === "week") {
        now.setDate(now.getDate() - 7);
        startDate = now;
      } else if (timeframe === "month") {
        now.setMonth(now.getMonth() - 1);
        startDate = now;
      } else if (timeframe === "year") {
        now.setFullYear(now.getFullYear() - 1);
        startDate = now;
      }

      if (startDate) {
        q = query(expensesRef, where("userId", "==", userId), where("date", ">=", startDate));
      }
    }

    const querySnapshot = await getDocs(q);
    const expenses = querySnapshot.docs.map((doc) => doc.data());

    if (groupBy === "category") {
      const categoryStats: Record<string, number> = {};
      expenses.forEach((expense) => {
        categoryStats[expense.category] = (categoryStats[expense.category] || 0) + expense.amount;
      });

      return Object.entries(categoryStats)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);
    } else {
      const monthStats: Record<string, number> = {};
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      expenses.forEach((expense) => {
        const monthName = months[new Date(expense.date).getMonth()];
        monthStats[monthName] = (monthStats[monthName] || 0) + expense.amount;
      });

      return Object.entries(monthStats)
        .map(([month, amount]) => ({ month, amount }))
        .sort((a, b) => months.indexOf(a.month) - months.indexOf(b.month));
    }
  } catch (error) {
    console.error("Error fetching expense stats:", error);
    throw error;
  }
};