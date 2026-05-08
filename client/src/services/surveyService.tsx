import axios from 'axios';
import { Platform } from 'react-native';

export const surveyService = {
  // 1. الواجهة الأولى: إرسال بيانات الاستبيان والفيديوهات
  submitSurvey: async (formData: any, videos: string[]) => {
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));

      videos.forEach((uri, index) => {
        const filename = uri.split('/').pop() || `video_${index}.mp4`;
        data.append('Videos', {
          uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
          name: filename,
          type: 'video/mp4',
        } as any);
      });

      const response = await axios.post(`http://10.28.2.207:5027/api/Samples/upload/sarab-ai`, data, {
        headers: { 'Accept': 'application/json', 'Content-Type': 'multipart/form-data' },
        transformRequest: (data) => data, // لمنع axios من تحويل البيانات إلى JSON
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // 2. الواجهة الثانية: إرسال التسجيل الصوتي فقط
  uploadVoiceRecording: async (audioUri: string) => {
    try {
      const data = new FormData();
      
      // الحصول على اسم الملف من الـ URI
      const filename = audioUri.split('/').pop() || 'recording.m4a';
      
      // التغليف المتوافق مع Swagger (المفتاح هو AudioFile)
      data.append('AudioFile', {
        uri: Platform.OS === 'android' ? audioUri : audioUri.replace('file://', ''),
        name: filename,
        type: 'audio/x-m4a', // أو audio/mpeg حسب الصيغة
      } as any);

      const response = await axios.post(`http://10.28.2.207:5027/api/ASR`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data; // هذا سيعيد الـ JSON الذي يحتوي على بيانات الحقول
      } catch (error: any) {
        if (error.response) {
          // سيطبع حالة الخطأ (مثلاً 500 أو 404)
          console.log("Status:", error.response.status);
          // سيطبع نص الخطأ الخام حتى لو لم يكن JSON
          console.log("Raw Error Data:", error.response.data);
        } else {
          console.log("Error Message:", error.message);
        }
      throw error;
    }
  }
};