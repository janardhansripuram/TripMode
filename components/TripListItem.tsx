import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Calendar, DollarSign } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { THEME_COLORS } from '@/constants/colors';
import { TripData } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';

interface TripListItemProps {
  trip: TripData;
}

export default function TripListItem({ trip }: TripListItemProps) {
  const { theme } = useTheme();
  const colors = THEME_COLORS[theme];
  const router = useRouter();
  
  const handlePress = () => {
    router.push(`/trip-details?id=${trip.id}`);
  };
  
  // Check if trip is active, upcoming, or past
  const now = new Date();
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  
  let status = '';
  let statusColor = '';
  
  if (now < startDate) {
    status = 'Upcoming';
    statusColor = colors.warning;
  } else if (now > endDate) {
    status = 'Completed';
    statusColor = colors.success;
  } else {
    status = 'Active';
    statusColor = colors.primary;
  }
  
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={handlePress}
    >
      <ImageBackground
        source={{ uri: trip.imageUrl || 'https://images.pexels.com/photos/3935702/pexels-photo-3935702.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
        style={styles.image}
        imageStyle={styles.imageStyle}
      >
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </ImageBackground>
      
      <View style={styles.content}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {trip.name}
        </Text>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MapPin size={16} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]} numberOfLines={1}>
              {trip.destination}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Calendar size={16} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {format(startDate, 'MMM d')} - {format(endDate, 'MMM d')}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <DollarSign size={16} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {formatCurrency(trip.budget)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    height: 140,
    width: '100%',
  },
  imageStyle: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  name: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    marginBottom: 12,
  },
  infoRow: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 8,
  },
});