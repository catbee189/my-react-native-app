import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ResetPasswordScreen = ({ navigation }) => {
  const [newPass, setNewPass] = useState('');
  const [retypePass, setRetypePass] = useState('');

  // Focus states for animation
  const newPassFocused = useRef(new Animated.Value(0)).current;
  const retypePassFocused = useRef(new Animated.Value(0)).current;

  const handleFocus = (anim) => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = (anim) => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColorNewPass = newPassFocused.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ccc', '#007BFF'], // gray to blue
  });

  const borderColorRetypePass = retypePassFocused.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ccc', '#007BFF'],
  });

 const handleReset = () => {
  if (!newPass || !retypePass) {
    alert('Please fill in both fields');
    return;
  }

  if (newPass !== retypePass) {
    alert('Passwords do not match!');
    return;
  }

  // Show success alert, then redirect to Login
  alert('Password reset successfully!');
  navigation.navigate('Login'); // Go directly to Login screen
};


  return (
    <View style={styles.container}>
      <Text style={styles.header}>Reset Your Password</Text>

      <Animated.View style={[styles.inputWrapper, { borderBottomColor: borderColorNewPass }]}>
        <Ionicons name="lock-closed-outline" size={20} color="#007BFF" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={newPass}
          onChangeText={setNewPass}
          onFocus={() => handleFocus(newPassFocused)}
          onBlur={() => handleBlur(newPassFocused)}
        />
      </Animated.View>

      <Animated.View style={[styles.inputWrapper, { borderBottomColor: borderColorRetypePass }]}>
        <Ionicons name="lock-closed-outline" size={20} color="#007BFF" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Re-type Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={retypePass}
          onChangeText={setRetypePass}
          onFocus={() => handleFocus(retypePassFocused)}
          onBlur={() => handleBlur(retypePassFocused)}
        />
      </Animated.View>

      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#007BFF',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    marginBottom: 30,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#000',
    outlineWidth:0,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 25,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
  },
  backText: {
    color: '#007BFF',
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
});

export default ResetPasswordScreen;
