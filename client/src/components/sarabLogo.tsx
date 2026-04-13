import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/colors';

export const SarabLogo = () => (
  <View style={styles.logoContainer}>
    <Text style={styles.logoText}>Sarab Ai</Text>
    <View style={styles.eyeContainer}>
      <Ionicons name="eye-outline" size={85} color={Colors.white} />
      <View style={styles.lashes}>
        <View style={[styles.lash, styles.lashLeft]} />
        <View style={[styles.lash, styles.lashCenter]} />
        <View style={[styles.lash, styles.lashRight]} />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center', 
  },
  logoText: {
    fontSize: 52,
    fontWeight: 'bold',
    color: Colors.white,
    letterSpacing: 4,
    marginBottom: 5,
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
  eyeContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  lashes: { flexDirection: 'row', marginTop: -20 },
  lash: { width: 3.5, height: 15, backgroundColor: Colors.white, marginHorizontal: 10, borderRadius: 2 },
  lashLeft: { transform: [{ rotate: '25deg' }] },
  lashCenter: { transform: [{ translateY: 5 }] },
  lashRight: { transform: [{ rotate: '-25deg' }] },
});