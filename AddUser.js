import React, { useRef, useState, useEffect } from 'react';
import {
  Alert,
  Animated,
  Button,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { addDoc, collection } from 'firebase/firestore';
import { db } from './firebase'; // Ensure firebase is correctly configured
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function AddUserScreen({ navigation }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-250)).current;

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

  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -250,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setMenuVisible(false);
    });
  };

  return (
    <>
      <TouchableOpacity onPress={openMenu} style={styles.menuButton}>
        <Ionicons name="menu" size={28} color="#333" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ padding: 20, marginTop: 60 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Add User</Text>

        <TextInput placeholder="Full Name *" value={name} onChangeText={setName} style={styles.input} />

        <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 15 }}>
          <Picker selectedValue={role} onValueChange={(itemValue) => setRole(itemValue)} mode="dropdown">
            <Picker.Item label="Select Role *" value="" />
            <Picker.Item label="Admin" value="Admin" />
            <Picker.Item label="Pastor" value="Pastor" />
            <Picker.Item label="Members" value="Members" />
          </Picker>
        </View>

        <TextInput placeholder="Email *" value={email} onChangeText={setEmail} keyboardType="email-address" style={styles.input} />
        <TextInput placeholder="Phone Number *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} />
        <TextInput placeholder="Password *" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
        <TextInput placeholder="Address" value={address} onChangeText={setAddress} style={styles.input} />

        <Button title="Save" onPress={handleSubmit} />
      </ScrollView>

      {/* Sidebar Modal */}
      <Modal transparent={true} visible={menuVisible} animationType="none" onRequestClose={closeMenu}>
        <Pressable style={styles.modalOverlay} onPress={closeMenu}>
          <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
            {/* Profile Section */}
            <View style={styles.profileSection}>
              <View style={styles.profileRow}>
                <Text style={styles.profileName}>Pastor John</Text>
                <View style={styles.onlineBullet} />
              </View>
              <Text style={styles.profileStatus}>Online</Text>
            </View>

            {/* Navigation Links */}
            <TouchableOpacity style={styles.sidebarButton} onPress={() => { closeMenu(); navigation.navigate('ManagerUser'); }}>
              <Ionicons name="person-outline" size={20} color="#555" style={styles.icon} />
              <Text style={styles.sidebarItemText}>Manager User</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sidebarButton} onPress={() => { closeMenu(); navigation.navigate('schedule'); }}>
              <MaterialIcons name="schedule" size={20} color="#555" style={styles.icon} />
              <Text style={styles.sidebarItemText}>Schedule of Manager</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sidebarButton} onPress={() => { closeMenu(); navigation.navigate('booking'); }}>
              <MaterialIcons name="event-available" size={20} color="#555" style={styles.icon} />
              <Text style={styles.sidebarItemText}>Appointment Booking</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sidebarButton} onPress={() => { closeMenu(); navigation.navigate('visit'); }}>
              <FontAwesome5 name="calendar-check" size={18} color="#555" style={styles.icon} />
              <Text style={styles.sidebarItemText}>Visit Schedule</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sidebarButton} onPress={() => { closeMenu(); navigation.navigate('divition'); }}>
              <Ionicons name="book-outline" size={20} color="#555" style={styles.icon} />
              <Text style={styles.sidebarItemText}>Prayer & Devotion Tracker</Text>
            </TouchableOpacity>

            {/* Logout */}
            <TouchableOpacity style={[styles.sidebarButton, { marginTop: 20 }]} onPress={() => { closeMenu(); navigation.navigate('Login'); }}>
              <MaterialIcons name="logout" size={20} color="#D9534F" style={styles.icon} />
              <Text style={[styles.sidebarItemText, { color: '#D9534F' }]}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
  },
  menuButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 999,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    flexDirection: 'row',
  },
  sidebar: {
    width: 250,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 40,
  },
  profileSection: {
    marginBottom: 30,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  onlineBullet: {
    width: 10,
    height: 10,
    backgroundColor: 'green',
    borderRadius: 5,
  },
  profileStatus: {
    color: 'gray',
    marginTop: 4,
  },
  sidebarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sidebarItemText: {
    fontSize: 16,
    color: '#333',
  },
  icon: {
    marginRight: 10,
  },
});
