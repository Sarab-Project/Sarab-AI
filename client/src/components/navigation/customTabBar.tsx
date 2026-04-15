import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';

const TAB_ICONS: any = {
  'index': { active: 'home', inactive: 'home-outline' },
  'survey': { active: 'cloud-upload', inactive: 'cloud-upload-outline' },
  'history': { active: 'time', inactive: 'time-outline' },
};

export const CustomTabBar = ({ state, navigation }: any) => {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const currentIcon = TAB_ICONS[route.name] || TAB_ICONS['index'];

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity 
            key={route.key} 
            onPress={onPress} 
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isFocused ? currentIcon.active : currentIcon.inactive} 
              size={26} 
              color={isFocused ? "#fff" : "rgba(255,255,255,0.5)"} 
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 25, 
    left: 20,
    right: 20,
    backgroundColor: Colors.primary || '#b39ddb',
    borderRadius: 35,
    height: 65, 
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
});