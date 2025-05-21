import React, { useState } from 'react';
import {
  StyleSheet, TextInput, View, Text, Animated, Easing,
  TouchableOpacity, Image, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from './firebase'; // Your firebase.js
import { collection, query, where, getDocs } from 'firebase/firestore';

const FloatingInput = ({ label, icon, isPassword, value, setValue }) => {
  const [isFocused, setIsFocused] = useState(false);
  const labelAnim = useState(new Animated.Value(value ? 1 : 0))[0];

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(labelAnim, {
      toValue: 1,
      duration: 150,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) {
      Animated.timing(labelAnim, {
        toValue: 0,
        duration: 150,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    }
  };

  const labelStyle = {
    position: 'absolute',
    left: 36,
    top: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [12, -10],
    }),
    fontSize: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: '#007BFF',
    backgroundColor: '#fff',
    paddingHorizontal: 4,
  };

  return (
    <View style={styles.inputWrapper}>
      <Ionicons name={icon} size={20} color="#007BFF" style={styles.icon} />
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      <TextInput
        style={[
          styles.input,
          isFocused || value ? styles.inputFocused : styles.inputEmpty,
        ]}
        secureTextEntry={isPassword}
        value={value}
        onChangeText={setValue}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholderTextColor="#aaa"
        underlineColorAndroid="transparent"
        autoCapitalize="none"
        keyboardType={label === 'Email' ? 'email-address' : 'default'}
      />
    </View>
  );
};

const LoginForm = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      alert(`${title}\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert('Error', 'Please enter both email and password.');
      return;
    }

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email), where('password', '==', password));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        showAlert('Login Failed', 'Invalid email or password.');
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      showAlert('Success', `Welcome back, ${userData.name || email}!`);

      setTimeout(() => {
navigation.navigate('DashboardScreen', { user: userData });
      }, 1000);

    } catch (error) {
      showAlert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('./assets/dog.jpg')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.signin}>Sign In</Text>
      </View>

      <FloatingInput label="Email" icon="mail-outline" value={email} setValue={setEmail} />
      <FloatingInput label="Password" icon="lock-closed-outline" isPassword value={password} setValue={setPassword} />

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  header: { marginBottom: 40, alignItems: 'center' },
  signin: {
    fontSize: 24,
    color: '#007BFF',
    fontWeight: 'bold',
    marginTop: 8,
    borderBottomColor: '#007BFF',
    borderBottomWidth: 2,
  },
  forgotPasswordText: {
    color: '#007BFF',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 20,
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  logo: { width: 260, height: 60, marginBottom: 20, borderRadius: 30, overflow: 'hidden' },
  inputWrapper: { position: 'relative', marginBottom: 32, paddingLeft: 36 },
  input: {
    height: 40,
    fontSize: 16,
    color: '#007BFF',
    paddingTop: 12,
    borderBottomColor: '#007BFF',
    borderBottomWidth: 1,
  },
  inputFocused: { borderBottomColor: '#0056D2', borderBottomWidth: 2, outlineWidth: 0 },
  inputEmpty: { borderBottomWidth: 0 },
  icon: { position: 'absolute', left: 8, top: 14 },
  loginButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase' },
});

export default LoginForm;
