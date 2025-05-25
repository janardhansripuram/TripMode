import { TripData, ExpenseData } from '@/types';

export const mockTrips: TripData[] = [
  {
    id: 'trip1',
    name: 'Paris Getaway',
    destination: 'Paris, France',
    startDate: '2023-11-15T00:00:00.000Z',
    endDate: '2023-11-22T00:00:00.000Z',
    budget: 2000,
    imageUrl: 'https://images.pexels.com/photos/532826/pexels-photo-532826.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    userId: 'user1',
    createdAt: '2023-10-01T00:00:00.000Z',
    updatedAt: '2023-10-01T00:00:00.000Z'
  },
  {
    id: 'trip2',
    name: 'Tokyo Adventure',
    destination: 'Tokyo, Japan',
    startDate: '2023-12-10T00:00:00.000Z',
    endDate: '2023-12-20T00:00:00.000Z',
    budget: 3500,
    imageUrl: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    userId: 'user1',
    createdAt: '2023-10-15T00:00:00.000Z',
    updatedAt: '2023-10-15T00:00:00.000Z'
  },
  {
    id: 'trip3',
    name: 'New York City Trip',
    destination: 'New York, USA',
    startDate: '2024-02-05T00:00:00.000Z',
    endDate: '2024-02-12T00:00:00.000Z',
    budget: 2800,
    imageUrl: 'https://images.pexels.com/photos/802024/pexels-photo-802024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    userId: 'user1',
    createdAt: '2023-11-20T00:00:00.000Z',
    updatedAt: '2023-11-20T00:00:00.000Z'
  },
  {
    id: 'trip4',
    name: 'Bangkok Explorer',
    destination: 'Bangkok, Thailand',
    startDate: '2024-03-15T00:00:00.000Z',
    endDate: '2024-03-25T00:00:00.000Z',
    budget: 1800,
    imageUrl: 'https://images.pexels.com/photos/1031659/pexels-photo-1031659.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    userId: 'user1',
    createdAt: '2023-12-05T00:00:00.000Z',
    updatedAt: '2023-12-05T00:00:00.000Z'
  },
  {
    id: 'trip5',
    name: 'Rome Holiday',
    destination: 'Rome, Italy',
    startDate: '2024-05-10T00:00:00.000Z',
    endDate: '2024-05-17T00:00:00.000Z',
    budget: 2200,
    imageUrl: 'https://images.pexels.com/photos/532263/pexels-photo-532263.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    userId: 'user1',
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z'
  }
];

export const mockExpenses: ExpenseData[] = [
  {
    id: 'exp1',
    title: 'Hotel Booking',
    amount: 650,
    currency: 'USD',
    category: 'accommodation',
    date: '2023-11-15T00:00:00.000Z',
    notes: 'Le Grand Hotel, 5 nights',
    tripId: 'trip1',
    userId: 'user1',
    createdAt: '2023-10-20T00:00:00.000Z',
    updatedAt: '2023-10-20T00:00:00.000Z'
  },
  {
    id: 'exp2',
    title: 'Flight Tickets',
    amount: 780,
    currency: 'USD',
    category: 'transport',
    date: '2023-11-15T00:00:00.000Z',
    notes: 'Round trip flights',
    tripId: 'trip1',
    userId: 'user1',
    createdAt: '2023-10-21T00:00:00.000Z',
    updatedAt: '2023-10-21T00:00:00.000Z'
  },
  {
    id: 'exp3',
    title: 'Restaurant Le Petit',
    amount: 120,
    currency: 'USD',
    category: 'food',
    date: '2023-11-16T00:00:00.000Z',
    tripId: 'trip1',
    userId: 'user1',
    createdAt: '2023-11-16T00:00:00.000Z',
    updatedAt: '2023-11-16T00:00:00.000Z'
  },
  {
    id: 'exp4',
    title: 'Louvre Museum Tickets',
    amount: 60,
    currency: 'USD',
    category: 'activities',
    date: '2023-11-17T00:00:00.000Z',
    tripId: 'trip1',
    userId: 'user1',
    createdAt: '2023-11-17T00:00:00.000Z',
    updatedAt: '2023-11-17T00:00:00.000Z'
  },
  {
    id: 'exp5',
    title: 'Metro Passes',
    amount: 40,
    currency: 'USD',
    category: 'transport',
    date: '2023-11-16T00:00:00.000Z',
    tripId: 'trip1',
    userId: 'user1',
    createdAt: '2023-11-16T00:00:00.000Z',
    updatedAt: '2023-11-16T00:00:00.000Z'
  },
  {
    id: 'exp6',
    title: 'Souvenirs',
    amount: 85,
    currency: 'USD',
    category: 'shopping',
    date: '2023-11-19T00:00:00.000Z',
    tripId: 'trip1',
    userId: 'user1',
    createdAt: '2023-11-19T00:00:00.000Z',
    updatedAt: '2023-11-19T00:00:00.000Z'
  },
  {
    id: 'exp7',
    title: 'Tokyo Dome Hotel',
    amount: 900,
    currency: 'USD',
    category: 'accommodation',
    date: '2023-12-10T00:00:00.000Z',
    tripId: 'trip2',
    userId: 'user1',
    createdAt: '2023-11-25T00:00:00.000Z',
    updatedAt: '2023-11-25T00:00:00.000Z'
  },
  {
    id: 'exp8',
    title: 'Sushi Restaurant',
    amount: 150,
    currency: 'USD',
    category: 'food',
    date: '2023-12-11T00:00:00.000Z',
    tripId: 'trip2',
    userId: 'user1',
    createdAt: '2023-12-11T00:00:00.000Z',
    updatedAt: '2023-12-11T00:00:00.000Z'
  },
  {
    id: 'exp9',
    title: 'Disney Tokyo Tickets',
    amount: 180,
    currency: 'USD',
    category: 'entertainment',
    date: '2023-12-14T00:00:00.000Z',
    tripId: 'trip2',
    userId: 'user1',
    createdAt: '2023-12-14T00:00:00.000Z',
    updatedAt: '2023-12-14T00:00:00.000Z'
  },
  {
    id: 'exp10',
    title: 'Airport Taxi',
    amount: 70,
    currency: 'USD',
    category: 'transport',
    date: '2023-12-10T00:00:00.000Z',
    tripId: 'trip2',
    userId: 'user1',
    createdAt: '2023-12-10T00:00:00.000Z',
    updatedAt: '2023-12-10T00:00:00.000Z'
  }
];