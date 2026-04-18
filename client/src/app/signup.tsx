import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// استيراد المكونات والثوابت الاحترافية
import { SarabInput } from '../components/sarabInput';
import { Colors } from '../constants/colors';

export default function SignUpScreen() {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header - متناسق تماماً مع شاشة Login */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Account</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Full Name */}
        <SarabInput 
          label="Full name"
          placeholder="Enter your full name"
        />

        {/* Email */}
        <SarabInput 
          label="Email"
          placeholder="example@example.com"
          keyboardType="email-address"
        />

        {/* Password */}
        <SarabInput 
          label="Password"
          placeholder="***************"
          isPassword={true}
          secureTextEntry={!passwordVisible}
          togglePassword={() => setPasswordVisible(!passwordVisible)}
        />

        {/* Mobile Number */}
        <SarabInput 
          label="Mobile Number"
          placeholder="+963 xxxxxxxxx"
          keyboardType="phone-pad"
        />

        {/* Academic Document - حقل رفع الملفات بتصميمه الخاص */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>University ID or Graduation Certificate</Text>
          <TouchableOpacity style={styles.uploadWrapper}>
            <Ionicons name="cloud-upload-outline" size={24} color={Colors.primary} />
            <Text style={styles.uploadText}>Upload document image</Text>
          </TouchableOpacity>
          <Text style={styles.helperText}>* Required for account verification</Text>
        </View>

        {/* Terms */}
        <Text style={styles.termsText}>
          By continuing, you agree to {'\n'}
          <Text style={styles.linkText}>Terms of Use</Text> and <Text style={styles.linkText}>Privacy Policy.</Text>
        </Text>

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.mainButton}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.linkText}>Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.white 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: 60, 
    marginTop: 40, 
  },
  backButton: { position: 'absolute', left: 20 },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: Colors.primary 
  },
  content: { 
    paddingHorizontal: 30, 
    paddingTop: 20,
    paddingBottom: 40 
  },
  inputSection: { marginBottom: 18 },
  label: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: Colors.textMain, 
    marginBottom: 10,
    marginLeft: 5 
  },
  
  // تنسيق حقل رفع الملفات المخصص
  uploadWrapper: {
    backgroundColor: Colors.lightBg,
    borderRadius: 15,
    height: 65,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  uploadText: {
    color: Colors.primary,
    fontSize: 15,
    marginLeft: 10,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 5,
    marginLeft: 5,
  },

  termsText: { 
    textAlign: 'center', 
    color: Colors.textSecondary, 
    fontSize: 13, 
    marginTop: 15,
    lineHeight: 20 
  },
  mainButton: {
    backgroundColor: Colors.primary,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  buttonText: { color: Colors.white, fontSize: 20, fontWeight: 'bold' },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 30 
  },
  footerText: { color: Colors.textSecondary, fontSize: 15 },
  linkText: { 
    color: Colors.primary, 
    fontWeight: 'bold',
    fontSize: 15 
  }
});