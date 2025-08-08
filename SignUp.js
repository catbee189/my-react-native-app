import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Correct import
import { db } from './firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';

const SignUp = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState('');
  const [purok, setPurok] = useState('PUROK , RANG-AY PALUMBI'); // Default value or use TextInput

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      alert(`${title}\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !password || !rePassword || !address || !gender || !purok) {
      showAlert('Error', 'Please fill all fields.');
      return;
    }

    if (password !== rePassword) {
      showAlert('Error', 'Passwords do not match.');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'members'), {
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        email,
        password,
        address,
        gender,
        purok, // Add purok field
        createdAt: new Date(),
        member_id: '', // placeholder
      });

      // Now update the document with its own ID as member_id
      await updateDoc(doc(db, 'members', docRef.id), {
        member_id: docRef.id,
      });

      showAlert('Success', 'Account created successfully!');
      navigation.navigate('Loginmem');
    } catch (error) {
      showAlert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        placeholder="First Name"
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        placeholder="Last Name"
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        placeholder="Email"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Address"
        style={styles.input}
        value={address}
        onChangeText={setAddress}
      />

      <Text style={styles.label}>Gender:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={gender}
          style={styles.picker}
          onValueChange={(itemValue) => setGender(itemValue)}
        >
          <Picker.Item label="Select Gender" value="" />
          <Picker.Item label="Male" value="Male" />
          <Picker.Item label="Female" value="Female" />
        </Picker>
      </View>

      <TextInput
        placeholder="Purok"
        style={styles.input}
        value={purok}
        onChangeText={setPurok}
      />

      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        placeholder="Re-type Password"
        style={styles.input}
        secureTextEntry
        value={rePassword}
        onChangeText={setRePassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Loginmem')}>
        <Text style={styles.loginText}>Already have an account? Sign in</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    color: '#007BFF',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 45,
    borderColor: '#007BFF',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    outlineWidth: 0,
  },
  label: {
    marginTop: 8,
    fontSize: 16,
    color: '#333',
  },
  pickerContainer: {
    borderColor: '#007BFF',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    height: 45,
    width: '100%',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  loginText: {
    color: '#007BFF',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default SignUp;
