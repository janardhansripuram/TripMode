import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { Link } from 'expo-router';
import { Plus, Search, Filter, Wallet } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { THEME_COLORS } from '@/constants/colors';
import { fetchTrips } from '@/services/expenseService';
import TripListItem from '@/components/TripListItem';
import { TripData } from '@/types';

export default function TripsScreen() {
  const { theme } = useTheme();
  const colors = THEME_COLORS[theme];
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trips, setTrips] = useState<TripData[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<TripData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  const loadTrips = async () => {
    try {
      const tripsData = await fetchTrips();
      setTrips(tripsData);
      setFilteredTrips(tripsData);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    loadTrips();
  }, []);
  
  const onRefresh = () => {
    setRefreshing(true);
    loadTrips();
  };
  
  const filterTrips = (filter: string) => {
    setActiveFilter(filter);
    
    let filtered = trips;
    if (filter === 'active') {
      filtered = trips.filter(trip => new Date(trip.endDate) >= new Date());
    } else if (filter === 'past') {
      filtered = trips.filter(trip => new Date(trip.endDate) < new Date());
    } else if (filter === 'upcoming') {
      filtered = trips.filter(trip => new Date(trip.startDate) > new Date());
    }
    
    if (searchQuery) {
      filtered = filtered.filter(trip => 
        trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.destination.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredTrips(filtered);
  };
  
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    if (!text) {
      filterTrips(activeFilter);
      return;
    }
    
    const filtered = trips.filter(trip => 
      trip.name.toLowerCase().includes(text.toLowerCase()) ||
      trip.destination.toLowerCase().includes(text.toLowerCase())
    );
    
    setFilteredTrips(filtered);
  };
  
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>My Trips</Text>
        <Link href="/trips/new" asChild>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]}>
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>New Trip</Text>
          </TouchableOpacity>
        </Link>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Search size={20} color={colors.textLight} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search trips..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
        
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Filter size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.filterTabs}>
        <TouchableOpacity 
          style={[
            styles.filterTab, 
            activeFilter === 'all' && { backgroundColor: colors.primaryLight }
          ]}
          onPress={() => filterTrips('all')}
        >
          <Text 
            style={[
              styles.filterTabText, 
              { color: activeFilter === 'all' ? colors.primary : colors.textLight }
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterTab, 
            activeFilter === 'active' && { backgroundColor: colors.primaryLight }
          ]}
          onPress={() => filterTrips('active')}
        >
          <Text 
            style={[
              styles.filterTabText, 
              { color: activeFilter === 'active' ? colors.primary : colors.textLight }
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterTab, 
            activeFilter === 'upcoming' && { backgroundColor: colors.primaryLight }
          ]}
          onPress={() => filterTrips('upcoming')}
        >
          <Text 
            style={[
              styles.filterTabText, 
              { color: activeFilter === 'upcoming' ? colors.primary : colors.textLight }
            ]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterTab, 
            activeFilter === 'past' && { backgroundColor: colors.primaryLight }
          ]}
          onPress={() => filterTrips('past')}
        >
          <Text 
            style={[
              styles.filterTabText, 
              { color: activeFilter === 'past' ? colors.primary : colors.textLight }
            ]}
          >
            Past
          </Text>
        </TouchableOpacity>
      </View>
      
      {filteredTrips.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Wallet size={60} color={colors.textLight} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No trips found</Text>
          <Text style={[styles.emptyDescription, { color: colors.textLight }]}>
            {searchQuery ? 
              'Try a different search term or filter' : 
              'Create a new trip to start tracking your expenses'
            }
          </Text>
          
          {!searchQuery && (
            <Link href="/trips/new" asChild>
              <TouchableOpacity style={[styles.emptyButton, { backgroundColor: colors.primary }]}>
                <Plus size={20} color="#FFFFFF" />
                <Text style={styles.emptyButtonText}>Create Trip</Text>
              </TouchableOpacity>
            </Link>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredTrips}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <TripListItem trip={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  filterButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  filterTabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
});