import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

import { ProfilePicture } from '../../components/profile/profilePicture';
import { CustomInput } from '../../components/ui/customInput';
import { Colors } from '../../constants/theme';
import { useUserStore } from '../../store/useUserStore';

export default function ProfileManagerScreen() {
  const router = useRouter();
  
  const { userName, userImage, setUser } = useUserStore();

  const [profileImage, setProfileImage] = useState<string | null>(userImage);
  const [fullName, setFullName] = useState(userName || '');
  const [phoneNumber, setPhoneNumber] = useState('+963 9456 789 147'); 
  const [isFullImageVisible, setIsFullImageVisible] = useState(false);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('صلاحيات مطلوبة', 'نحتاج للوصول إلى الصور لتغيير ملفك الشخصي');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleUpdate = () => {
    if (fullName.trim().length < 3) {
      Alert.alert("خطأ", "يرجى إدخال اسم صحيح (3 أحرف على الأقل)");
      return;
    }

    setUser({
      name: fullName,
      image: profileImage, 
    });

    Alert.alert("نجاح", "تم تحديث الملف الشخصي بنجاح", [
      { text: "موافق", onPress: () => router.back() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={28} color={Colors.primary} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Edit Profile</Text>
            </View>

            <ScrollView 
              contentContainerStyle={styles.scrollContent} 
              showsVerticalScrollIndicator={false}
            >
              
              <View style={styles.imageSection}>
                <ProfilePicture 
                  imageUri={profileImage}
                  size={135}
                  showControls={true} 
                  onPick={handlePickImage}
                  onRemove={() => setProfileImage(null)} 
                  onView={() => profileImage && setIsFullImageVisible(true)}
                />
              </View>

              <View style={styles.form}>
                <CustomInput 
                  label="Full Name"
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your name"
                />

                <CustomInput 
                  label="Phone Number"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  placeholder="+963 --- --- ---"
                />
              </View>

              <TouchableOpacity 
                style={styles.updateButton} 
                onPress={handleUpdate}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Update Profile</Text>
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <Modal visible={isFullImageVisible} transparent animationType="fade">
        <View style={styles.modalBg}>
          <TouchableOpacity 
            style={styles.closeBtn} 
            onPress={() => setIsFullImageVisible(false)}
          >
            <Ionicons name="close" size={35} color="white" />
          </TouchableOpacity>
          {profileImage && (
            <Image 
              source={{ uri: profileImage }} 
              style={styles.fullImg} 
              resizeMode="contain" 
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white || '#fff' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    height: 60, marginTop: Platform.OS === 'android' ? 40 : 10 
  },imageSection: { alignItems: 'center', marginBottom: 30 },
  backButton: { position: 'absolute', left: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.primary || '#b39ddb' },
  scrollContent: { paddingHorizontal: 30, paddingTop: 30 },
  form: { marginTop: 40 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10, marginLeft: 5 },
  input: { 
    backgroundColor: Colors.inputBg || '#f8f9ff', borderRadius: 15, padding: 15, 
    fontSize: 16, color: '#333', borderWidth: 1, borderColor: '#eee' 
  },
  updateButton: { 
    backgroundColor: Colors.primary || '#b39ddb', height: 60, borderRadius: 30, 
    justifyContent: 'center', alignItems: 'center', marginTop: 20, elevation: 5 
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  fullImg: { width: '90%', height: '70%' },
  closeBtn: { position: 'absolute', top: 50, right: 25 },
});