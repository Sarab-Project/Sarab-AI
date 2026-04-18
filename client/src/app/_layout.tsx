import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from "expo-router";
import { useEffect } from 'react';
import { Platform } from 'react-native';
import "../../global.css";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

if (!publishableKey) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}


export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      // إخفاء شريط التنقل تماماً
      NavigationBar.setVisibilityAsync("hidden");
      
      // تجربة المستخدم: يظهر الشريط عند السحب ثم يختفي تلقائياً (Sticky)
      // هذا هو الوضع المثالي للألعاب والتطبيقات ذات الشاشة الكاملة
      NavigationBar.setBehaviorAsync("sticky-swipe");
    }
  }, []);
  return <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <Stack screenOptions={{headerShown: false}}/>
    </ClerkProvider>
}
