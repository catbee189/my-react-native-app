import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const OTPVerifyScreen = ({ navigation }) => {
  const length = 9;
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const inputsRef = useRef([]);

  const handleChange = (text, index) => {
    if (/^\d*$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
      if (text && index < length - 1) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const verifyOtp = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length === length) {
      alert('OTP Verified: ' + enteredOtp);
      navigation.navigate('resetpassword'); // Navigate to login
    } else {
      alert('Please enter complete OTP');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Ionicons name="lock-closed-outline" size={64} color="#0056D2" style={{ marginBottom: 20 }} />
      <Text style={styles.header}>Verify OTP Code</Text>
      <Text style={styles.subText}>Enter the 9-digit code sent to your email or phone.</Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, idx) => (
          <TextInput
            key={idx}
            ref={el => inputsRef.current[idx] = el}
            value={digit}
            style={styles.otpBox}
            keyboardType="numeric"
            maxLength={1}
            onChangeText={text => handleChange(text, idx)}
            onKeyPress={e => handleKeyPress(e, idx)}
            returnKeyType="done"
            textAlign="center"
          />
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={verifyOtp}>
        <Text style={styles.buttonText}>Verify OTP</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.backText}>Back to Login</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: '#0056D2',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
    marginBottom: 32,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  otpBox: {
    width: 34,
    height: 48,
    borderWidth: 1,
    borderColor: '#007BFF',
    borderRadius: 6,
    fontSize: 22,
    color: '#000',
  },
  button: {
    backgroundColor: '#0056D2',
    paddingVertical: 14,
    borderRadius: 30,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 18,
    textTransform: 'uppercase',
  },
  backText: {
    color: '#0056D2',
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
});

export default OTPVerifyScreen;
