import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/colors';

export const SarabInput = ({ label, placeholder, isPassword, value, onChangeText, keyboardType, secureTextEntry, togglePassword, ...props }) => (
  <View style={styles.inputSection}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <TextInput 
        style={styles.input} 
        placeholder={placeholder} 
        placeholderTextColor={Colors.placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
        {...props}
      />
      {isPassword && (
        <TouchableOpacity onPress={togglePassword}>
          <Ionicons name={secureTextEntry ? "eye-outline" : "eye-off-outline"} size={24} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  inputSection: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: Colors.textMain, marginBottom: 10, marginLeft: 5 },
  inputWrapper: {
    backgroundColor: Colors.lightBg,
    borderRadius: 15,
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  input: { flex: 1, fontSize: 16, color: Colors.textMain },
});