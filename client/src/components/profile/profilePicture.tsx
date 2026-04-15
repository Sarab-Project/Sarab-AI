import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/theme';

interface ProfilePictureProps {
  imageUri: string | null;
  onPick: () => void;
  onRemove: () => void;
  onView: () => void;
}

export const ProfilePicture = ({ imageUri, onPick, onRemove, onView }: ProfilePictureProps) => {
  return (
    <View style={styles.outerContainer}> 
      <View style={styles.imageWrapper}>
        
        <TouchableOpacity activeOpacity={0.8} onPress={onView}>
          <View style={styles.circle}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} />
            ) : (
              <View style={styles.absoluteCenter}>
                <MaterialCommunityIcons 
                  name="account-circle" 
                  size={165} 
                  color={Colors.placeholder} 
                  style={styles.defaultIcon}
                />
              </View>
            )}
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.editBadge} onPress={onPick}>
          <Ionicons name="pencil" size={16} color="#fff" />
        </TouchableOpacity>

        {imageUri && (
          <TouchableOpacity style={styles.deleteBadge} onPress={onRemove}>
            <Ionicons name="trash-outline" size={16} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 10,
  },
  imageWrapper: { 
    position: 'relative', 
    width: 125, 
    height: 125,
  },
  circle: { 
    width: 125, 
    height: 125, 
    borderRadius: 62.5, 
    borderWidth: 2, 
    borderColor: Colors.bgLight || '#f3f0ff', 
    overflow: 'hidden', 
    backgroundColor: Colors.bgLight || '#f3f0ff',
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  absoluteCenter: {
    position: 'absolute',
    top: -15, left: -22, right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultIcon: { includeFontPadding: false, textAlignVertical: 'center' },
  
  editBadge: {
    position: 'absolute',
    right: 5, 
    bottom: 0, 
    backgroundColor: Colors.primary || '#b39ddb',
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    zIndex: 10,
  },
  
  deleteBadge: {
    position: 'absolute',
    left: 5, 
    bottom: 0,
    backgroundColor: '#ff4d4d',
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    zIndex: 10,
  },
});