import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/theme';

interface ActionButtonsProps {
  onCameraPress: () => void;
  onUploadPress: () => void;
  count: number;
  cameraLabel: string; 
  uploadLabel: string; 
  orLabel: string;
}

export const ActionButtons = ({ 
  onCameraPress, 
  onUploadPress, 
  count,
  cameraLabel,
  uploadLabel,
  orLabel 
}: ActionButtonsProps) => {
  const isDisabled = count >= 2;

  return (
    <View style={styles.actionContainer}>
      <TouchableOpacity 
        style={[styles.inputBox, isDisabled && styles.disabledBox]} 
        onPress={onCameraPress}
        disabled={isDisabled}
      >
        <Text style={styles.inputPlaceholder}>
          {cameraLabel} 
        </Text>
        <Ionicons name="camera-outline" size={24} color={Colors.primary} />
      </TouchableOpacity>
      
      <Text style={styles.orText}>{orLabel}</Text>
      
      <TouchableOpacity 
        style={[styles.inputBox, isDisabled && styles.disabledBox]} 
        onPress={onUploadPress}
        disabled={isDisabled}
      >
        <Text style={styles.inputPlaceholder}>
          {uploadLabel}
        </Text>
        <Ionicons name="cloud-upload-outline" size={24} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionContainer: { 
    alignItems: 'center', 
    gap: 10, 
    marginBottom: 20, 
    paddingHorizontal: 25 
  },
  inputBox: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    width: '100%', 
    backgroundColor: '#f3f0ff', 
    padding: 18, 
    borderRadius: 18 
  },
  disabledBox: { opacity: 0.4 },
  inputPlaceholder: { 
    color: Colors.primary, 
    fontSize: 16, 
    fontWeight: '600' 
  },
  orText: { 
    fontSize: 18, 
    color: Colors.primary, 
    fontWeight: '300' 
  },
});