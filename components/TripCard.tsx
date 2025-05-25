import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, DollarSign } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { THEME_COLORS } from '@/constants/colors';
import { TripData } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';

interface TripCardProps {
  trip: TripData;
}

export default function TripCard({ trip }: TripCardProps) {
  const { theme } = useTheme();
  const colors = THEME_COLORS[theme];
  const router = useRouter();
  
  const handlePress = () => {
    router.push(`/trip-details?id=${trip.id}`);
  };
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
    >
      <ImageBackground
        source={{ uri: trip.imageUrl || 'https://images.pexels.com/photos/3935702/pexels-photo-3935702.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
        style={styles.image}
        imageStyle={styles.imageStyle}
      >
        <View style={styles.overlay}>
          <Text style={styles.name} numberOfLines={1}>{trip.name}</Text>
          <Text style={styles.destination} numberOfLines={1}>{trip.destination}</Text>
          
          <View style={styles.infoContainer}>
            <View style={styles.info}>
              <Calendar size={14} color="#FFFFFF" />
              <Text style={styles.infoText}>
                {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d')}
              </Text>
            </View>
            
            <View style={styles.info}>
              <DollarSign size={14} color="#FFFFFF" />
              <Text style={styles.infoText}>
                {formatCurrency(trip.budget)}
              </Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageStyle: {
    borderRadius: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 16,
    justifyContent: 'flex-end',
  },
  name: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  destination: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
  },
});