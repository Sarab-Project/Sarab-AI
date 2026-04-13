import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

export const FormInput = ({ style, ...props }: any) => (
  <TextInput 
    style={[styles.input, style]} 
    placeholderTextColor="#b39ddb" 
    {...props} 
  />
);

const styles = StyleSheet.create({
  input: { 
    backgroundColor: '#f3f0ff', 
    padding: 16, 
    borderRadius: 15, 
    color: '#333',
    fontSize: 16
  }
});