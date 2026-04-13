import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

import { FormInput } from '../../components/survey/formInput';
import { Colors } from '../../constants/colors';
import { useSurveyForm } from '../../hooks/useSurveyForm';
import { useVideoManager } from '../../hooks/useVideoManager'; // إعادة استخدام الـ Hook السابق

export default function SurveyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const { form, updateField, isFormValid } = useSurveyForm();
  const { videos, addVideo, removeVideo } = useVideoManager(2);

  // استقبال الفيديوهات القادمة من الصفحة الرئيسية
  useEffect(() => {
    if (params.videoUris) {
      try {
        const uris = JSON.parse(params.videoUris as string);
        uris.forEach((uri: string) => addVideo(uri));
      } catch (e) {
        console.error("Error parsing videos:", e);
      }
    }
  }, [params.videoUris]);

  const handleUpload = () => {
    if (videos.length < 2) {
      Alert.alert("بيانات ناقصة", "يجب توفر فيديوهين لإتمام عملية التحليل.");
      return;
    }

    if (!isFormValid()) {
      Alert.alert("تنبيه", "يرجى تعبئة جميع الحقول المطلوبة.");
      return;
    }

    // هنا يتم استدعاء الـ API مستقبلاً
    console.log("SURVEY DATA:", { ...form, videos });
    
    Alert.alert("حالة المنصة", "جاري رفع العينات للتحليل...", [
      { text: "موافق", onPress: () => router.replace('/(tabs)') }
    ]);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Sarab Platform</Text>
          
          <TouchableOpacity 
            style={[styles.uploadMainBtn, (videos.length < 2 || !isFormValid()) && styles.disabledBtn]} 
            onPress={handleUpload}
          >
            <Text style={styles.uploadMainText}>Upload Samples</Text>
          </TouchableOpacity>

          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Samples ({videos.length}/2)</Text>
            
            {/* عرض الفيديوهات المضافة */}
            {videos.map((uri, index) => (
              <View key={index} style={styles.fileCard}>
                <View style={styles.fileInfo}>
                  <MaterialCommunityIcons name="video-check" size={24} color={Colors.primary} />
                  <Text style={styles.fileName} numberOfLines={1}>Sample Video {index + 1}</Text>
                </View>
                <TouchableOpacity onPress={() => removeVideo(index)}>
                  <Ionicons name="trash-outline" size={20} color="#ff4d4d" />
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.divider} />

            {/* الحقول المعتمدة على الـ Hook */}
            <FormInput placeholder="Eye side" value={form.eye_side} onChangeText={(v: string) => updateField('eye_side', v)} />
            
            <View style={styles.row}>
              <FormInput style={{flex: 1}} placeholder="Gender" value={form.gender} onChangeText={(v: string) => updateField('gender', v)} />
              <FormInput style={{flex: 1}} placeholder="Age" value={form.age} onChangeText={(v: string) => updateField('age', v)} keyboardType="numeric" />
            </View>

            <FormInput placeholder="City" value={form.city} onChangeText={(v: string) => updateField('city', v)} />
            <FormInput placeholder="State" value={form.status} onChangeText={(v: string) => updateField('status', v)} />
            <FormInput placeholder="Profession" value={form.profession} onChangeText={(v: string) => updateField('profession', v)} />
            
            <FormInput 
              style={styles.textArea} 
              placeholder="Additional Notes" 
              value={form.notes} 
              onChangeText={(v: string) => updateField('notes', v)} 
              multiline 
            />
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingHorizontal: 25, paddingTop: 50 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, color: '#333', textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#666', marginBottom: 10 },
  uploadMainBtn: { backgroundColor: Colors.primary || '#b39ddb', paddingVertical: 18, borderRadius: 35, alignItems: 'center', elevation: 4 },
  disabledBtn: { opacity: 0.5 },
  uploadMainText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  formContainer: { marginTop: 25, gap: 15 },
  fileCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fcfaff', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#e1d7f5' },
  fileInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  fileName: { fontSize: 14, color: '#333', fontWeight: '500', flex: 1 },
  row: { flexDirection: 'row', gap: 10 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  textArea: { height: 120, textAlignVertical: 'top' }
});