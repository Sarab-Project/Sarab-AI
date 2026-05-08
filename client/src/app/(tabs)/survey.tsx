import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av'; // مكتبة التسجيل
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { useVideoManager } from '../../hooks/useVideoManager';
import { surveyService } from '../../services/surveyService';


export default function SurveyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { form, updateField, isFormValid } = useSurveyForm();
  const { videos, addVideo, removeVideo } = useVideoManager(2);

  // --- حالات التسجيل الجديدة ---
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

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

  // --- وظائف التسجيل ---
  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') return;

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
    } catch (err) { console.error(err); }
  }


  async function stopRecording() {
    if (!recording) return;
    setIsRecording(false);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        Alert.alert(
          "تم التسجيل",
          "هل تريد تحليل الصوت لتعبئة البيانات؟",
          [
            { text: "إعادة", style: "destructive" },
            { 
              text: "تحليل", 
              onPress: async () => {
                try {
                  setLoading(true);
                  const result = await surveyService.uploadVoiceRecording(uri);
                  


                  console.log("البيانات المستلمة من السيرفر:", JSON.stringify(result, null, 2));
                  // هنا نقوم بتعبئة الحقول من الـ JSON الراجع
                  // ملاحظة: تأكد من مسميات الحقول الراجعة من السيرفر (مثلاً result.Age أو result.age)
                  if (result) {
                    if (result.EyeSide || result.eyeside) updateField('EyeSide', result.EyeSide || result.eyeside);
                    if (result.Gender || result.gender) updateField('Gender', result.Gender || result.gender);
                    if (result.Age || result.age) updateField('Age', String(result.Age || result.age));
                    if (result.City || result.city) updateField('City', result.City || result.city);
                    if (result.Status || result.status) updateField('Status', result.Status || result.status);
                    if (result.Profession || result.profession) updateField('Profession', result.Profession || result.profession);
                    if (result.Notes || result.notes) updateField('Notes', result.Notes || result.notes);
                    
                    Alert.alert("نجاح", "تمت تعبئة البيانات من التسجيل الصوتي.");
                  }
                } catch (err) {
                  Alert.alert("خطأ", "فشل تحليل الملف الصوتي.");
                } finally {
                  setLoading(false);
                }
              } 
            }
          ]
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  const handleUpload = async () => {
    if (videos.length < 2) {
      Alert.alert("بيانات ناقصة", "يجب توفر فيديوهين لإتمام عملية التحليل.");
      return;
    }

    if (!isFormValid()) {
      Alert.alert("تنبيه", "يرجى تعبئة جميع الحقول المطلوبة.");
      return;
    }

    setLoading(true); // تشغيل مؤشر التحميل

    try {
      // استدعاء الخدمة وإرسال البيانات والفيديوهات
      const response = await surveyService.submitSurvey({
        EyeSide: form.EyeSide,
        Gender: form.Gender,
        Age: form.Age,
        City: form.City,
        Status: form.Status,
        Profession: form.Profession,
        Notes: form.Notes,
      }, videos);

      console.log("Upload Success:", response);

      Alert.alert("نجاح", "تم رفع العينات والبيانات بنجاح", [
        { text: "موافق", onPress: () => router.replace('/(tabs)') }
      ]);
    } catch (error: any) {
      console.error("Upload Failed:", error);
      Alert.alert("خطأ في الرفع", "تعذر إرسال البيانات للسيرفر، تأكد من الاتصال.");
    } finally {
      setLoading(false); // إيقاف مؤشر التحميل
    }
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

            <FormInput placeholder="Eye side" value={form.EyeSide} onChangeText={(v: string) => updateField('EyeSide', v)} />

            <View style={styles.row}>
              <FormInput style={{ flex: 1 }} placeholder="Gender" value={form.Gender} onChangeText={(v: string) => updateField('Gender', v)} />
              <FormInput style={{ flex: 1 }} placeholder="Age" value={form.Age} onChangeText={(v: string) => updateField('Age', v)} keyboardType="numeric" />
            </View>

            <FormInput placeholder="City" value={form.City} onChangeText={(v: string) => updateField('City', v)} />
            <FormInput placeholder="State" value={form.Status} onChangeText={(v: string) => updateField('Status', v)} />
            <FormInput placeholder="Profession" value={form.Profession} onChangeText={(v: string) => updateField('Profession', v)} />

            <FormInput
              style={styles.textArea}
              placeholder="Additional Notes"
              value={form.Notes}
              onChangeText={(v: string) => updateField('Notes', v)}
              multiline
            />
          </View>

          {/* --- التعديل الجديد: الزر الدائري --- */}
          <View style={styles.audioSection}>
            <TouchableOpacity
              onPressIn={startRecording}  // يبدأ عند الضغط
              onPressOut={stopRecording} // ينتهي عند الرفع
              style={[styles.micButton, isRecording && styles.micActive]}
            >
              <Ionicons name={isRecording ? "mic" : "mic-outline"} size={35} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.micText}>
              {isRecording ? "جاري التسجيل..." : "اضغط مطولاً للتسجيل"}
            </Text>
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
  textArea: { height: 120, textAlignVertical: 'top' },





  audioSection: {
    alignItems: 'center',
    marginVertical: 30,
  },
  micButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary, // لون المنصة الأساسي
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  micActive: {
    backgroundColor: '#ff4d4d', // يتغير للأحمر عند التسجيل
    transform: [{ scale: 1.1 }],
  },
  micText: {
    marginTop: 10,
    color: '#777',
    fontSize: 14,
  },
});