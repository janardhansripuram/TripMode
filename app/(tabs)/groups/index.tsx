import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Users, Plus } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { THEME_COLORS } from '@/constants/colors';
import { getGroups } from '@/services/groupService';
import { GroupData } from '@/types';

export default function GroupsScreen() {
  const { theme } = useTheme();
  const colors = THEME_COLORS[theme];
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<GroupData[]>([]);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const groupsData = await getGroups();
      setGroups(groupsData);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>My Groups</Text>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/groups/new')}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Create Group</Text>
        </TouchableOpacity>
      </View>

      {groups.length === 0 ? (
        <View style={styles.emptyState}>
          <Users size={48} color={colors.textLight} />
          <Text style={[styles.emptyStateText, { color: colors.text }]}>
            No groups yet
          </Text>
          <Text style={[styles.emptyStateSubtext, { color: colors.textLight }]}>
            Create a group to start tracking shared expenses
          </Text>
          <TouchableOpacity
            style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/groups/new')}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.emptyStateButtonText}>Create First Group</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.groupCard, { backgroundColor: colors.card }]}
              onPress={() => router.push(`/groups/${item.id}`)}
            >
              <Text style={[styles.groupName, { color: colors.text }]}>
                {item.name}
              </Text>
              <Text style={[styles.groupDetails, { color: colors.textLight }]}>
                Currency: {item.currency}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  listContent: {
    padding: 24,
  },
  groupCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  groupName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 4,
  },
  groupDetails: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
});