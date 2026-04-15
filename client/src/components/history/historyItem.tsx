import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';

interface HistoryItemProps {
  item: {
    id: string;
    title: string;
    time: string;
    date: string;
  };
  onPress: (id: string) => void;
}

export const HistoryItem = ({ item, onPress }: HistoryItemProps) => {
  return (
    <TouchableOpacity 
      style={styles.historyItem} 
      onPress={() => onPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.infoColumn}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>
      <View style={styles.dateColumn}>
        <Text style={styles.dateText}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  historyItem: {
    padding: 15,
    backgroundColor: '#f3f0ff',
    borderRadius: 15,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1d7f5', // تفتيح الحدود قليلاً لإعطاء عمق
  },
  infoColumn: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary || '#b39ddb',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 13,
    color: '#b39ddb',
    fontWeight: '500',
  },
  dateColumn: {
    alignItems: 'flex-end',
  },
  dateText: { 
    color: '#b39ddb', 
    fontSize: 12,
    fontWeight: 'bold'
  }
});