// EditUser.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export default function EditUser({ route, navigation }) {
  const { user } = route.params; // contains user.id

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('');

  // Fetch the user data from Firebase
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRef = doc(db, 'users', user.id);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setName(userData.name || '');
          setEmail(userData.email || '');
          setPhone(userData.phone || '');
          setAddress(userData.address || '');
          setRole(userData.role || '');
        } else {
          Alert.alert('Error', 'User not found');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Fetch user error:', error);
        Alert.alert('Error', 'Failed to fetch user data');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleUpdate = async () => {
  try {
    const userRef = doc(db, 'users', user.id);
    await updateDoc(userRef, {
      name,
      email,
      phone,
      address,
      role,
    });

    if (Platform.OS === 'web') {
      alert('User updated successfully');
    } else {
      Alert.alert('Success', 'User updated successfully');
    }

    // 🔁 Trigger the refresh callback if provided
    if (route.params?.onUpdate) {
      route.params.onUpdate();
    }

    navigation.goBack();
  } catch (error) {
    console.error('Update error:', error);
    Alert.alert('Error', 'Failed to update user');
  }
};

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading user data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit User</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />
      <TextInput
        style={styles.input}
        placeholder="Role"
        value={role}
        onChangeText={setRole}
      />

      <TouchableOpacity onPress={handleUpdate} style={styles.updateButton}>
        <Text style={styles.buttonText}>Update User</Text>
      </TouchableOpacity>
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    marginVertical: 8,
    borderRadius: 5,
    padding: 10,
  },
  updateButton: {
    marginTop: 20,
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
