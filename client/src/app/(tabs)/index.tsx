import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// استيراد الثوابت والمكونات والـ Hooks المخصصة
import { ActionButtons } from '../../components/home/actionButtons';
import { CameraModal } from '../../components/home/cameraModal';
import { VideoCard } from '../../components/home/videoCard';
import { DarkTheme, LightTheme } from '../../constants/theme'; // استيراد الثيمين
import { useVideoManager } from '../../hooks/useVideoManager';
import { useUserStore } from '../../store/useUserStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CONTAINER_PADDING = 25;
const ACTUAL_AVAILABLE_WIDTH = SCREEN_WIDTH - (CONTAINER_PADDING * 2);
const VIDEO_CARD_WIDTH = ACTUAL_AVAILABLE_WIDTH;

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation(); 
  const { userName, userImage, theme } = useUserStore(); // جلب الثيم من الـ Store

  // اختيار الألوان النشطة بناءً على الثيم
  const Colors = theme === 'dark' ? DarkTheme : LightTheme;

  const { videos, addVideo, pickVideoFile, removeVideo } = useVideoManager(2);
  const [isCameraOpen, setCameraOpen] = useState(false);

  const handleStartAnalysis = () => {
    if (videos.length < 2) return;
    router.push({
      pathname: '/survey',
      params: { videoUris: JSON.stringify(videos) }
    });
  };

  // تمرير الألوان الديناميكية للأنماط
  const dynamicStyles = createStyles(Colors);

  return (
    <View style={dynamicStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Header Section */}
        <View style={dynamicStyles.header}>
          <View style={dynamicStyles.profileSection}>
            <TouchableOpacity onPress={() => router.push('/profile')}>
              <View style={dynamicStyles.avatarCircle}>
                {userImage ? (
                  <Image source={{ uri: userImage }} style={dynamicStyles.avatarImage} />
                ) : (
                  <View style={dynamicStyles.placeholderAvatar}>
                    <MaterialCommunityIcons name="account-circle" size={48} color={Colors.placeholder} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <View>
              <Text style={dynamicStyles.welcomeText}>{t('home.welcome')}</Text>
              <Text style={dynamicStyles.userName}>{userName || 'User'}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <ActionButtons 
          onCameraPress={() => setCameraOpen(true)} 
          onUploadPress={pickVideoFile} 
          count={videos.length}
          cameraLabel={t('home.open_camera', { count: videos.length })}
          uploadLabel={t('home.select_file', { count: videos.length })}
          orLabel={t('home.or')}
          // ملاحظة: تأكد أن ActionButtons يستقبل Colors كـ Prop أو يستخدم الـ Store داخلياً
        />

        {/* منطقة عرض الفيديوهات */}
        <View style={dynamicStyles.displayArea}>
          {videos.length > 0 ? (
            <ScrollView 
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false}
              snapToInterval={VIDEO_CARD_WIDTH}
              decelerationRate="fast"
            >
              {videos.map((uri, index) => (
                <VideoCard 
                  key={index} 
                  uri={uri} 
                  index={index} 
                  title={index === 0 ? t('home.sample_1') : t('home.sample_2')}
                  onRemove={removeVideo} 
                  width={VIDEO_CARD_WIDTH} 
                />
              ))}
              
              {videos.length === 1 && (
                <View style={[dynamicStyles.videoCardPlaceholder, { width: VIDEO_CARD_WIDTH }]}>
                   <MaterialCommunityIcons name="video-plus-outline" size={50} color={Colors.primary} style={{opacity: 0.2}} />
                   <Text style={dynamicStyles.emptyCardText}>{t('home.waiting_second_video')}</Text>
                </View>
              )}
            </ScrollView>
          ) : (
            <View style={dynamicStyles.emptyContent}>
              <MaterialCommunityIcons name="brain" size={100} color={Colors.primary} style={{opacity: 0.3}} />
              <Text style={dynamicStyles.emptyTitle}>{t('home.add_samples')}</Text>
            </View>
          )}
        </View>

        {/* Analysis Section */}
        <View style={dynamicStyles.analysisSection}>
            <TouchableOpacity 
              style={[dynamicStyles.brainIconContainer, videos.length < 2 && dynamicStyles.disabledBrain]} 
              onPress={handleStartAnalysis}
              activeOpacity={0.7}
              disabled={videos.length < 2}
            >
              <MaterialCommunityIcons name="brain" size={42} color="white" />
            </TouchableOpacity>
            <Text style={[dynamicStyles.analysisLabel, videos.length < 2 && {color: Colors.placeholder}]}>
              {t('home.start_analysis')}
            </Text>
        </View>
      </ScrollView>

      <CameraModal 
        visible={isCameraOpen} 
        onClose={() => setCameraOpen(false)} 
        onSave={addVideo} 
        videoCount={videos.length}
      />
    </View>
  );
}

// دالة لإنشاء الأنماط بناءً على الألوان الممرة
const createStyles = (Colors: any) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background, // يتغير حسب الثيم
    paddingHorizontal: 25, 
    paddingTop: Platform.OS === 'ios' ? 60 : 40, 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 30 
  },
  profileSection: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 15 
  },
  avatarCircle: { 
    width: 54, 
    height: 54, 
    borderRadius: 27, 
    backgroundColor: Colors.bgLight, 
    borderWidth: 1.5, 
    borderColor: Colors.primary, 
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  placeholderAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: { 
    fontSize: 13, 
    color: Colors.primary, 
    fontWeight: '500' 
  },
  userName: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: Colors.text 
  },
  displayArea: { 
    height: 380, 
    backgroundColor: Colors.inputBg, 
    borderRadius: 30, 
    overflow: 'hidden' 
  },
  emptyContent: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  emptyTitle: { 
    color: Colors.primary, 
    marginTop: 10, 
    fontWeight: '500' 
  },
  videoCardPlaceholder: { 
    height: '100%',
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: Colors.background, 
    opacity: 0.8
  },
  emptyCardText: { 
    color: Colors.primary, 
    fontSize: 14, 
    fontWeight: '500', 
    opacity: 0.5 
  },
  analysisSection: { 
    marginTop: 30, 
    alignItems: 'center', 
    gap: 10 
  },
  brainIconContainer: { 
    width: 85, 
    height: 85, 
    borderRadius: 45, 
    backgroundColor: Colors.primary, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 8,
    shadowColor: Colors.primary, 
    shadowOpacity: 0.3, 
    shadowRadius: 10 
  },
  disabledBrain: { 
    backgroundColor: Colors.placeholder, 
    elevation: 0, 
    shadowOpacity: 0 
  },
  analysisLabel: { 
    fontSize: 16, 
    color: Colors.primary, 
    fontWeight: 'bold' 
  },
});