import { collection, addDoc, getDocs, getDoc, doc, query, where, orderBy, limit, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '@/config/firebase';
import { ExpenseData, TripData, StatsByCategory, StatsByMonth } from '@/types';

// Mock data for demonstration until Firebase connection is established
import { mockTrips, mockExpenses } from '@/utils/mockData';

// TRIPS

export const fetchTrips = async (): Promise<TripData[]> => {
  // Use mock data for now
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockTrips);
    }, 500);
  });
  
  // Actual implementation would be:
  /*
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
  */
};

export const fetchActiveTrips = async (): Promise<TripData[]> => {
  // Use mock data for now
  return new Promise((resolve) => {
    const now = new Date();
    const activeTrips = mockTrips.filter(trip => 
      new Date(trip.endDate) >= now
    ).slice(0, 3);
    
    setTimeout(() => {
      resolve(activeTrips);
    }, 500);
  });
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

export const addTrip = async (tripData: Omit<TripData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  // Simulate adding a trip
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('new-trip-id');
    }, 800);
  });
};

export const updateTrip = async (tripId: string, tripData: Partial<TripData>): Promise<void> => {
  // Simulate updating a trip
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 800);
  });
};

export const deleteTrip = async (tripId: string): Promise<void> => {
  // Simulate deleting a trip
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 800);
  });
};

// EXPENSES

export const fetchExpenses = async (): Promise<ExpenseData[]> => {
  // Use mock data for now
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockExpenses);
    }, 500);
  });
};

export const fetchRecentExpenses = async (): Promise<ExpenseData[]> => {
  // Use mock data for now
  return new Promise((resolve) => {
    const recentExpenses = [...mockExpenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    
    setTimeout(() => {
      resolve(recentExpenses);
    }, 500);
  });
};

export const fetchTripExpenses = async (tripId: string): Promise<ExpenseData[]> => {
  // Use mock data for now
  return new Promise((resolve) => {
    const tripExpenses = mockExpenses.filter(expense => expense.tripId === tripId);
    
    setTimeout(() => {
      resolve(tripExpenses);
    }, 300);
  });
};

export const fetchExpenseById = async (expenseId: string): Promise<ExpenseData | null> => {
  // Use mock data for now
  return new Promise((resolve) => {
    const expense = mockExpenses.find(e => e.id === expenseId);
    
    setTimeout(() => {
      resolve(expense || null);
    }, 300);
  });
};

export const addExpense = async (expenseData: Omit<ExpenseData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  // Simulate adding an expense
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('new-expense-id');
    }, 800);
  });
};

export const updateExpense = async (expenseId: string, expenseData: Partial<ExpenseData>): Promise<void> => {
  // Simulate updating an expense
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 800);
  });
};

export const deleteExpense = async (expenseId: string): Promise<void> => {
  // Simulate deleting an expense
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 800);
  });
};

// STATISTICS

export const fetchTotalSpent = async (timeframe?: string): Promise<number> => {
  // Simulate fetching total spent
  return new Promise((resolve) => {
    let total = 0;
    
    if (timeframe === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      mockExpenses.forEach(expense => {
        if (new Date(expense.date) >= weekAgo) {
          total += expense.amount;
        }
      });
    } else if (timeframe === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      
      mockExpenses.forEach(expense => {
        if (new Date(expense.date) >= monthAgo) {
          total += expense.amount;
        }
      });
    } else if (timeframe === 'year') {
      const yearAgo = new Date();
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      
      mockExpenses.forEach(expense => {
        if (new Date(expense.date) >= yearAgo) {
          total += expense.amount;
        }
      });
    } else {
      // All time
      mockExpenses.forEach(expense => {
        total += expense.amount;
      });
    }
    
    setTimeout(() => {
      resolve(total);
    }, 300);
  });
};

export const fetchExpenseStats = async (groupBy: 'category' | 'month', timeframe?: string): Promise<StatsByCategory[] | StatsByMonth[]> => {
  // Simulate fetching expense statistics
  return new Promise((resolve) => {
    let filteredExpenses = [...mockExpenses];
    
    if (timeframe === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      filteredExpenses = filteredExpenses.filter(expense => 
        new Date(expense.date) >= weekAgo
      );
    } else if (timeframe === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      
      filteredExpenses = filteredExpenses.filter(expense => 
        new Date(expense.date) >= monthAgo
      );
    } else if (timeframe === 'year') {
      const yearAgo = new Date();
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      
      filteredExpenses = filteredExpenses.filter(expense => 
        new Date(expense.date) >= yearAgo
      );
    }
    
    if (groupBy === 'category') {
      const categoryStats: Record<string, number> = {};
      
      filteredExpenses.forEach(expense => {
        if (categoryStats[expense.category]) {
          categoryStats[expense.category] += expense.amount;
        } else {
          categoryStats[expense.category] = expense.amount;
        }
      });
      
      const result: StatsByCategory[] = Object.entries(categoryStats)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);
      
      setTimeout(() => {
        resolve(result);
      }, 500);
    } else {
      const monthStats: Record<string, number> = {};
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      filteredExpenses.forEach(expense => {
        const date = new Date(expense.date);
        const monthName = months[date.getMonth()];
        
        if (monthStats[monthName]) {
          monthStats[monthName] += expense.amount;
        } else {
          monthStats[monthName] = expense.amount;
        }
      });
      
      const result: StatsByMonth[] = Object.entries(monthStats)
        .map(([month, amount]) => ({ month, amount }))
        .sort((a, b) => {
          return months.indexOf(a.month) - months.indexOf(b.month);
        });
      
      setTimeout(() => {
        resolve(result);
      }, 500);
    }
  });
};