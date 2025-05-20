import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Or 'react-native-vector-icons/Ionicons'

const ForgetPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const labelAnim = useRef(new Animated.Value(email ? 1 : 0)).current;
  const borderColorAnim = useRef(new Animated.Value(email ? 1 : 0)).current;

  useEffect(() => {
    if (email) {
      Animated.timing(labelAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
      Animated.timing(borderColorAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [email]);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(labelAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    Animated.timing(borderColorAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!email) {
      Animated.timing(labelAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
      Animated.timing(borderColorAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const labelStyle = {
    position: 'absolute',
    left: 36,
    top: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [14, -10],
    }),
    fontSize: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: isFocused ? '#007BFF' : '#aaa',
    backgroundColor: '#fff',
    paddingHorizontal: 4,
  };

  const borderBottomColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ccc', '#007BFF'],
  });

  return (
    <View style={styles.container}>
      <Image
        source={require('./assets/email-logo-communications-brands-and-logotypes-gmail-14.png')}
        style={styles.logo}
      />

      <Text style={styles.title}>
        Enter your email address below and we'll send you a link to reset your password.
      </Text>

      <Animated.View style={[styles.inputWrapper, { borderBottomColor }]}>
        <Ionicons name="mail" size={20} color="#007BFF" style={styles.icon} />
        <Animated.Text style={labelStyle}>Email Address</Animated.Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder=""
          placeholderTextColor="#ccc"
        />
      </Animated.View>

 <TouchableOpacity
  style={styles.button}
  onPress={() => {
    if (!email.trim()) {
      alert('Please enter your email address');
    } else {
      alert('Reset link sent');
      navigation.navigate('Verification');
    }
  }}
>
  <Text style={styles.buttonText}>Send Reset Link</Text>
</TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logo: {
    alignSelf: 'center',
    marginBottom: 40,
    width: 40,
    height: 40,
    marginTop: 90,
  },
  title: {
    color: '#C9B194',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    fontSize: 12,
    width: 300,
    padding: 20,
    alignSelf: 'center',
  },
  inputWrapper: {
    borderBottomWidth: 2,
    marginBottom: 30,
    position: 'relative',
    paddingTop: 18,
    paddingBottom: 6,
  },
  icon: {
    position: 'absolute',
    left: 8,
    top: 14,
    zIndex: 1,
  },
  input: {
    height: 40,
    fontSize: 16,
    paddingLeft: 36,
    color: '#333',
    outlineWidth:0,
  },
  button: {
    backgroundColor: '#0056D2',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  backText: {
    color: '#0056D2',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default ForgetPasswordScreen;
