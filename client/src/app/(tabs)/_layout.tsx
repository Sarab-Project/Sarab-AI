import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import React from 'react';
import { CustomTabBar } from '../../components/navigation/customTabBar';

const { Navigator } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext(Navigator);

export default function TabLayout() {
  return (
    <MaterialTopTabs
      tabBarPosition="bottom"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        swipeEnabled: true, // ميزة رائعة في TopTabs
        lazy: true, // لتحميل الشاشات عند الحاجة فقط وتحسين الأداء
      }}
    >
      <MaterialTopTabs.Screen name="index" options={{ title: 'Home' }} />
      <MaterialTopTabs.Screen name="survey" options={{ title: 'Upload' }} />
      <MaterialTopTabs.Screen name="history" options={{ title: 'History' }} />
    </MaterialTopTabs>
  );
}