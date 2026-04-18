import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SarabInput } from '../components/sarabInput';
import { Colors } from '../constants/colors';

export default function LoginScreen() {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Log In</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.welcomeText}>Welcome</Text>

          {/* استخدام المكون الجاهز للإيميل */}
          <SarabInput 
            label="Email"
            placeholder="example@example.com"
            keyboardType="email-address"
          />

          {/* استخدام المكون الجاهز لكلمة المرور */}
          <SarabInput 
            label="Password"
            placeholder="***************"
            isPassword={true}
            secureTextEntry={!passwordVisible}
            togglePassword={() => setPasswordVisible(!passwordVisible)}
          />

          <TouchableOpacity style={styles.forgetPassword}>
            <Text style={styles.forgetText}>Forget Password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mainButton}>
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>or log In with</Text>
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialCircle}>
              <FontAwesome name="google" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={styles.linkText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 60, marginTop: 40 },
  backButton: { position: 'absolute', left: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.primary },
  content: { flex: 1, paddingHorizontal: 30, paddingTop: 30 },
  welcomeText: { fontSize: 32, fontWeight: 'bold', color: Colors.primary, marginBottom: 40 },
  forgetPassword: { alignSelf: 'flex-end', marginTop: -10, marginBottom: 20 },
  forgetText: { color: Colors.primary, fontSize: 14, fontWeight: '500' },
  mainButton: {
    backgroundColor: Colors.primary,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  buttonText: { color: Colors.white, fontSize: 20, fontWeight: 'bold' },
  orText: { textAlign: 'center', color: Colors.textSecondary, marginVertical: 25 },
  socialContainer: { alignItems: 'center' },
  socialCircle: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: Colors.softPurple,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderPurple,
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 'auto', marginBottom: 30 },
  footerText: { color: Colors.textSecondary, fontSize: 15 },
  linkText: { color: Colors.primary, fontWeight: 'bold', fontSize: 15 }
});