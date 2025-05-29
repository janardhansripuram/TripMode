import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image } from 'react-native';
import { Link } from 'expo-router';
import { Search, UserPlus, Users as UsersIcon } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { THEME_COLORS } from '@/constants/colors';

// Mock data for demonstration
const mockFriends = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '+1 234 567 8901',
    avatar: 'https://images.pexels.com/photos/3586798/pexels-photo-3586798.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    balance: 125.50,
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.c@example.com',
    phone: '+1 234 567 8902',
    avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    balance: -75.25,
  },
  {
    id: '3',
    name: 'Emma Wilson',
    email: 'emma.w@example.com',
    phone: '+1 234 567 8903',
    avatar: 'https://images.pexels.com/photos/3310695/pexels-photo-3310695.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    balance: 0,
  },
];

export default function FriendsScreen() {
  const { theme } = useTheme();
  const colors = THEME_COLORS[theme];
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredFriends = mockFriends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.phone.includes(searchQuery)
  );
  
  const renderFriendItem = ({ item }) => (
    <Link href={`/friends/${item.id}`} asChild>
      <TouchableOpacity style={[styles.friendCard, { backgroundColor: colors.card }]}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        
        <View style={styles.friendInfo}>
          <Text style={[styles.friendName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.friendEmail, { color: colors.textLight }]}>{item.email}</Text>
        </View>
        
        <View style={styles.balanceContainer}>
          <Text 
            style={[
              styles.balanceAmount,
              { 
                color: item.balance > 0 ? colors.success : 
                       item.balance < 0 ? colors.error : 
                       colors.text 
              }
            ]}
          >
            {item.balance > 0 ? `+$${item.balance}` :
             item.balance < 0 ? `-$${Math.abs(item.balance)}` :
             'Settled'}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Friends</Text>
        <Link href="/friends/add" asChild>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]}>
            <UserPlus size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Friend</Text>
          </TouchableOpacity>
        </Link>
      </View>
      
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Search size={20} color={colors.textLight} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search friends..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      {filteredFriends.length === 0 ? (
        <View style={styles.emptyContainer}>
          <UsersIcon size={48} color={colors.textLight} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No friends found</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textLight }]}>
            {searchQuery ? 
              'Try a different search term' : 
              'Add friends to start splitting expenses'}
          </Text>
          
          {!searchQuery && (
            <Link href="/friends/add" asChild>
              <TouchableOpacity style={[styles.emptyAddButton, { backgroundColor: colors.primary }]}>
                <UserPlus size={20} color="#FFFFFF" />
                <Text style={styles.emptyAddButtonText}>Add Your First Friend</Text>
              </TouchableOpacity>
            </Link>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredFriends}
          renderItem={renderFriendItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 8,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  friendInfo: {
    flex: 1,
    marginLeft: 16,
  },
  friendName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  friendEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  balanceContainer: {
    marginLeft: 16,
  },
  balanceAmount: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
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
  emptySubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyAddButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
});