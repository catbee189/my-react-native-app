import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Ionicons } from '@expo/vector-icons';
import SidebarModal from './SidebarModal'; // Sidebar with navigation links
import SidebarToggle from './SidebarToggle'; // Menu icon to open sidebar

export default function UserListScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state and selected user for editing
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form fields state for editing
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('');

  // Sidebar animation and visibility state
  const slideAnim = useRef(new Animated.Value(-250)).current;
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Fetch users from Firestore
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userList = [];
      querySnapshot.forEach((doc) => {
        userList.push({ id: doc.id, ...doc.data() });
      });
      setUsers(userList);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Delete user function
  const deleteUser = async (id) => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm('Are you sure you want to delete this user?');
      if (!confirm) return;
      await performDelete(id);
    } else {
      Alert.alert('Confirm Delete', 'Are you sure you want to delete this user?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => performDelete(id),
        },
      ]);
    }
  };

  const performDelete = async (id) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'users', id));
      Alert.alert('Success', 'User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      Alert.alert('Error', 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal and preload data
  const openEditModal = (user) => {
    setSelectedUser(user);
    setName(user.name || '');
    setEmail(user.email || '');
    setPhone(user.phone || '');
    setAddress(user.address || '');
    setRole(user.role || '');
    setEditModalVisible(true);
  };

  // Update user in Firestore
  const updateUser = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Name cannot be empty');
      return;
    }
    try {
      setLoading(true);
      const userRef = doc(db, 'users', selectedUser.id);
      await updateDoc(userRef, {
        name,
        email,
        phone,
        address,
        role,
      });
      Alert.alert('Success', 'User updated successfully');
      setEditModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert('Error', 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  // Render each user card
  const renderItem = ({ item }) => {
    const hasData = item.name || item.email || item.phone || item.address || item.role;

    return (
      
      <View style={styles.card}>
       <SidebarToggle onOpen={() => setSidebarVisible(true)} />
        <SidebarModal visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

        {/* Sidebar toggle placed here if you want the menu button on each card */}
        {/* Or move it outside FlatList for global header */}
        
        <View style={styles.cardHeader}>
          <Text style={styles.name}>{item.name || ''}</Text>

          {hasData && (
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => openEditModal(item)}>
                <Ionicons name="create-outline" size={20} color="#007bff" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => deleteUser(item.id)} style={{ marginLeft: 15 }}>
                <Ionicons name="trash-outline" size={20} color="#d9534f" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {item.role ? <Text style={styles.role}>Role: {item.role}</Text> : null}
        {item.email ? <Text>Email: {item.email}</Text> : null}
        {item.phone ? <Text>Phone: {item.phone}</Text> : null}
        {item.address ? <Text>Address: {item.address}</Text> : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Global sidebar toggle button */}
      
      <Text style={styles.title}>User List</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Edit User Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Edit User</Text>

              <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
              <TextInput style={styles.input} placeholder="Address" value={address} onChangeText={setAddress} />
              <TextInput style={styles.input} placeholder="Role" value={role} onChangeText={setRole} />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={updateUser}>
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    paddingTop: 80,
    paddingHorizontal: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  role: {
    color: 'gray',
    marginBottom: 5,
  },
  actions: {
    flexDirection: 'row',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  saveButton: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
