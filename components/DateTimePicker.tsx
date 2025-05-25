import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Modal } from 'react-native';
import { THEME_COLORS } from '@/constants/colors';
import { Calendar, ChevronDown } from 'lucide-react-native';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  theme: 'light' | 'dark';
}

export default function CustomDateTimePicker({ value, onChange, theme }: DateTimePickerProps) {
  const [date, setDate] = useState(value);
  const [showPicker, setShowPicker] = useState(false);
  const colors = THEME_COLORS[theme];

  const handleChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    setDate(currentDate);
    onChange(currentDate);
  };

  const showDatepicker = () => {
    if (Platform.OS === 'web') {
      // For web, we'll use the native input type="date"
      const input = document.createElement('input');
      input.type = 'date';
      input.value = format(date, 'yyyy-MM-dd');
      input.onchange = (e: any) => {
        const newDate = new Date(e.target.value);
        setDate(newDate);
        onChange(newDate);
      };
      input.click();
    } else {
      setShowPicker(true);
    }
  };

  return (
    <View>
      <TouchableOpacity 
        style={[styles.selector, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={showDatepicker}
      >
        <View style={styles.dateDisplay}>
          <Calendar size={20} color={colors.primary} />
          <Text style={[styles.dateText, { color: colors.text }]}>
            {format(date, 'MMMM d, yyyy')}
          </Text>
        </View>
        <ChevronDown size={20} color={colors.textLight} />
      </TouchableOpacity>

      {Platform.OS !== 'web' && showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
        />
      )}

      {Platform.OS === 'ios' && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showPicker}
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.centeredView}>
            <View style={[styles.modalView, { backgroundColor: colors.card }]}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={[styles.headerButton, { color: colors.primary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => {
                    onChange(date);
                    setShowPicker(false);
                  }}
                >
                  <Text style={[styles.headerButton, { color: colors.primary }]}>Confirm</Text>
                </TouchableOpacity>
              </View>
              
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={handleChange}
              />
              
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={() => setShowPicker(false)}
              >
                <Text style={styles.textStyle}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  selector: {
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginLeft: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  headerButton: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  button: {
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    marginTop: 15,
    width: '100%',
    alignItems: 'center',
  },
  textStyle: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    textAlign: 'center',
  },
});