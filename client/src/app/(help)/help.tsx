import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// استيراد الثوابت الموحدة
import { Colors } from '../../constants/theme';

// --- المكون الفرعي للخيار (لتحقيق مبدأ المسؤولية الواحدة) ---
const ContactOption = ({ item, isOpen, onPress }: { item: any, isOpen: boolean, onPress: () => void }) => {
  return (
    <View style={styles.optionWrapper}>
      <TouchableOpacity 
        style={styles.optionItem} 
        onPress={onPress} 
        activeOpacity={0.7}
      >
        <View style={styles.optionLeft}>
          <View style={styles.iconCircle}>
            {item.type === 'MaterialCommunityIcons' ? (
              <MaterialCommunityIcons name={item.icon} size={24} color="#fff" />
            ) : (
              <FontAwesome5 name={item.icon} size={20} color="#fff" />
            )}
          </View>
          <Text style={styles.optionText}>{item.title}</Text>
        </View>
        <Ionicons 
          name={isOpen ? "chevron-up" : "chevron-down"} 
          size={24} 
          color={Colors.primary} 
        />
      </TouchableOpacity>
      
      {/* محتوى الـ Accordion عند الفتح */}
      {isOpen && (
        <View style={styles.accordionContent}>
          <Text style={styles.accordionText}>
            We are here to help you via {item.title}. Our team usually responds within 24 hours.
          </Text>
        </View>
      )}
    </View>
  );
};

// --- الشاشة الرئيسية ---
export default function HelpCenterScreen() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const contactOptions = [
    { id: '1', title: 'Customer Service', icon: 'headphones', type: 'MaterialCommunityIcons' },
    { id: '2', title: 'Website', icon: 'earth', type: 'MaterialCommunityIcons' },
    { id: '3', title: 'Whatsapp', icon: 'whatsapp', type: 'FontAwesome5' },
    { id: '4', title: 'Instagram', icon: 'instagram', type: 'MaterialCommunityIcons' },
  ];

  const toggleAccordion = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header بنمط المشروع الموحد */}
      <View style={styles.purpleHeader}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help Center</Text>
        </View>
        <Text style={styles.headerSubtitle}>How Can We Help You?</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {/* زر التواصل الرئيسي */}
        <TouchableOpacity style={styles.contactUsButton} activeOpacity={0.8}>
          <Text style={styles.contactUsText}>Contact Us</Text>
        </TouchableOpacity>

        {/* عرض الخيارات باستخدام المكون الفرعي */}
        {contactOptions.map((item) => (
          <ContactOption 
            key={item.id} 
            item={item} 
            isOpen={expandedId === item.id}
            onPress={() => toggleAccordion(item.id)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  
  // Header Styles
  purpleHeader: {
    backgroundColor: Colors.primary || '#b39ddb',
    paddingTop: Platform.OS === 'android' ? 50 : 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30, // إضافة لمسة جمالية تتناسب مع باقي التطبيق
    borderBottomRightRadius: 30,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 60 },
  backButton: { position: 'absolute', left: 0 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { 
    fontSize: 16, 
    color: 'rgba(255, 255, 255, 0.9)', 
    textAlign: 'center', 
    marginTop: 5 
  },

  content: { paddingHorizontal: 25, paddingTop: 30, paddingBottom: 50 },
  
  // Contact Us Button
  contactUsButton: {
    backgroundColor: Colors.primary || '#b39ddb',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    width: '60%',
    alignSelf: 'center',
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  contactUsText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // Accordion Styles
  optionWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 5,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary || '#b39ddb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionText: { fontSize: 16, fontWeight: '600', color: '#333' },
  
  accordionContent: {
    paddingLeft: 59, // محاذاة النص مع بداية نص العنوان
    paddingBottom: 15,
    paddingRight: 10,
  },
  accordionText: {
    fontSize: 14,
    color: '#777',
    lineHeight: 20,
  },
});