import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { HistoryItem } from '../../components/history/historyItem';

export default function HistoryScreen() {
  
  // دالة توليد الوقت (يمكنك لاحقاً نقلها لملف utils إذا تكررت)
  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    return { date, time };
  };

  const dummyData = Array.from({ length: 15 }, (_, index) => ({
    id: index.toString(),
    title: `Analysis Result #${index + 1}`,
    ...getCurrentDateTime()
  }));

  const handleItemPress = (id: string) => {
    // الوظيفة التي ستتركها لاحقاً (مثلاً الانتقال لصفحة التفاصيل)
    console.log("Pressed item with ID:", id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>History</Text>
      
      <FlatList
        data={dummyData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <HistoryItem 
            item={item} 
            onPress={handleItemPress} 
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    paddingTop: 50, 
    paddingHorizontal: 20,
    alignContent:'center'
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    color: '#333',
    alignSelf:'center' 
  },
  listContent: {
    paddingBottom: 100, 
  }
});