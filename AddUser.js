import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Button,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { addDoc, collection } from 'firebase/firestore';
import { db } from './firebase'; // Ensure this is correctly configured
import SidebarModal from './SidebarModal'; // Sidebar with navigation links
import SidebarToggle from './SidebarToggle'; // Menu icon to open sidebar

const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function AddUserScreen({ navigation, route }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const slideAnim = useRef(new Animated.Value(-250)).current;
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const user = route?.params?.user || { name: 'Guest', role: 'N/A' };

  const handleSubmit = async () => {
    if (!name || !role || !email || !phone || !password) {
      showAlert('Error', 'Please fill all required fields (*)');
      return;
    }

    try {
      await addDoc(collection(db, 'users'), {
        name,
        role,
        email,
        phone,
        password,
        address,
        createdAt: new Date(),
      });
      showAlert('Success', 'User saved successfully!');
      setName('');
      setRole('');
      setEmail('');
      setPhone('');
      setPassword('');
      setAddress('');
      navigation.navigate('ManagerUser');
    } catch (error) {
      console.error('Error saving user:', error);
      showAlert('Error', 'Failed to save user.');
    }
  };

  return (
    <>
      <SidebarToggle onOpen={() => setSidebarVisible(true)} />
      <SidebarModal visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Add User</Text>

        <TextInput
          placeholder="Full Name *"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={role}
            onValueChange={(itemValue) => setRole(itemValue)}
            mode="dropdown"
          >
            <Picker.Item label="Select Role *" value="" />
            <Picker.Item label="Admin" value="Admin" />
            <Picker.Item label="Pastor" value="Pastor" />
            <Picker.Item label="Members" value="Members" />
          </Picker>
        </View>

        <TextInput
          placeholder="Email *"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          placeholder="Phone Number *"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
        />
        <TextInput
          placeholder="Password *"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <TextInput
          placeholder="Address"
          value={address}
          onChangeText={setAddress}
          style={styles.input}
        />

        <Button title="Save" onPress={handleSubmit} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 60,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 15,
  },
});
