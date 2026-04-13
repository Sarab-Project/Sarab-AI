// hooks/useVideoManager.ts
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { Alert } from 'react-native';

export const useVideoManager = (maxVideos: number = 2) => {
  const [videos, setVideos] = useState<string[]>([]);

  const addVideo = (uri: string) => {
    if (videos.length < maxVideos) {
      setVideos(prev => [...prev, uri]);
      return true;
    }
    Alert.alert("تنبيه", "لقد وصلت للحد الأقصى");
    return false;
  };

  const pickVideoFile = async () => {
    if (videos.length >= maxVideos) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'video/*' });
      if (!result.canceled) addVideo(result.assets[0].uri);
    } catch (error) {
      Alert.alert("خطأ", "فشل اختيار الملف");
    }
  };

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  return { videos, addVideo, pickVideoFile, removeVideo };
};