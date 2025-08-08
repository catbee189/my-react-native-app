import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import SidebarModal from './SidebarModal';
import SidebarToggle from './SidebarToggle';

export default function MemberList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', role: '' });
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Edit
  const openEditModal = (user) => {
    setSelectedUser(user);
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      role: user.role || '',
    });
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      const userRef = doc(db, 'users', selectedUser.id);
      await updateDoc(userRef, form);
      Alert.alert('Success', 'User updated');
      setModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update user');
    }
  };

  // Delete
 const handleDelete = async (id) => {
  if (Platform.OS === 'web') {
    const confirmDelete = window.confirm('Delete this user?');
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'users', id));
      alert('User successfully deleted.');
      fetchUsers();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete user.');
    }
  } else {
    Alert.alert('Confirm', 'Delete this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'users', id));
            Alert.alert('Deleted', 'User successfully deleted.');
            fetchUsers();
          } catch (error) {
            console.error('Delete error:', error);
            Alert.alert('Error', 'Failed to delete user.');
          }
        },
      },
    ]);
  }
};
  // Render User Card
  const renderItem = ({ item }) => {
    const hasData = item.name || item.email || item.phone || item.address || item.role;
    if (!hasData) return null;

    return (
      <View style={styles.card}>
        {item.name ? <Text style={styles.name}>{item.name}</Text> : null}
        {item.email ? <Text>Email: {item.email}</Text> : null}
        {item.phone ? <Text>Phone: {item.phone}</Text> : null}
        {item.address ? <Text>Address: {item.address}</Text> : null}
        {item.role ? <Text>Role: {item.role}</Text> : null}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
            <Text style={styles.btnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
            <Text style={styles.btnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Loader
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Sidebar Button & Modal */}
      <SidebarToggle onOpen={() => setSidebarVisible(true)} />
      <SidebarModal visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {/* List of Users */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text>No users found.</Text>}
      />

      {/* Modal for Edit */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit User</Text>
            {['name', 'email', 'phone', 'address', 'role'].map((field) => (
              <TextInput
                key={field}
                style={styles.input}
                placeholder={field}
                value={form[field]}
                onChangeText={(text) => setForm({ ...form, [field]: text })}
              />
            ))}
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={handleUpdate} style={styles.saveBtn}>
                <Text style={styles.btnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f4f4',
  },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  editBtn: {
    backgroundColor: '#4CAF50',
    padding: 10,
    marginRight: 8,
    borderRadius: 6,
  },
  deleteBtn: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 6,
  },
  btnText: {
    color: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 10,
    padding: 6,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveBtn: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
  },
  cancelBtn: {
    backgroundColor: '#9E9E9E',
    padding: 10,
    borderRadius: 6,
    flex: 1,
  },
});
