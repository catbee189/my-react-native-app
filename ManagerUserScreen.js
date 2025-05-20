import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity,
  Alert, Modal, Pressable, Animated, Platform
} from 'react-native';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

export default function UserListScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-250)).current;

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userList = [];
      querySnapshot.forEach((doc) => {
        userList.push({ id: doc.id, ...doc.data() });
      });
      setUsers(userList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };
const deleteUser = async (id) => {
  if (Platform.OS === 'web') {
    const confirm = window.confirm("Are you sure you want to delete this user?");
    if (!confirm) return;
  }

  // Show mobile alert confirmation
  if (Platform.OS !== 'web') {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => performDelete(id),
      },
    ]);
  } else {
    // Web directly perform delete after confirmation
    performDelete(id);
  }
};

const performDelete = async (id) => {
  try {
    setLoading(true);
    await deleteDoc(doc(db, 'users', id));
    
    if (Platform.OS === 'web') {
      alert('User deleted successfully');
    } else {
      Alert.alert('Success', 'User deleted successfully');
    }

    fetchUsers(); // refresh list
  } catch (error) {
    console.error('Error deleting user:', error);

    if (Platform.OS === 'web') {
      alert('Failed to delete user');
    } else {
      Alert.alert('Error', 'Failed to delete user');
    }
  } finally {
    setLoading(false);
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

  useEffect(() => {
    fetchUsers();
  }, []);

const renderItem = ({ item }) => {
  // Check if the item has any meaningful data
  const hasData = item.name || item.email || item.phone || item.address || item.role;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.name || ''}</Text>

        {/* Show Edit/Delete only if data exists */}
        {hasData && (
          <View style={styles.actions}>
           <TouchableOpacity
  onPress={() =>
    navigation.navigate('EditUser', {
      user: item,
      onUpdate: () => fetchUsers(), // callback function to refresh
    })
  }
>
  <Ionicons name="create-outline" size={20} color="#007bff" />
</TouchableOpacity>


            <TouchableOpacity onPress={() => deleteUser(item.id)} style={{ marginLeft: 15 }}>
              <Ionicons name="trash-outline" size={20} color="#d9534f" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Optional Fields */}
      {item.role ? <Text style={styles.role}>Role: {item.role}</Text> : null}
      {item.email ? <Text>Email: {item.email}</Text> : null}
      {item.phone ? <Text>Phone: {item.phone}</Text> : null}
      {item.address ? <Text>Address: {item.address}</Text> : null}
    </View>
  );
};


  return (
    <>
      <TouchableOpacity onPress={openMenu} style={styles.menuButton}>
        <Ionicons name="menu" size={28} color="#333" />
      </TouchableOpacity>

      <View style={styles.container}>
        <View style={styles.topRow}>
          <Text style={styles.title}>User List</Text>
       <TouchableOpacity
  onPress={() => navigation.navigate('add', {
    onAdd: () => fetchUsers(),
  })}
>
  <Text style={{ color: 'blue'   }}>Add User</Text>
</TouchableOpacity>


        </View>

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
      </View>

      {/* Sidebar Modal */}
      <Modal transparent={true} visible={menuVisible} animationType="none" onRequestClose={closeMenu}>
        <Pressable style={styles.modalOverlay} onPress={closeMenu}>
          <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.profileSection}>
              <View style={styles.profileRow}>
                <Text style={styles.profileName}>Pastor John</Text>
                <View style={styles.onlineBullet} />
              </View>
              <Text style={styles.profileStatus}>Online</Text>
            </View>

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
  container: {
    paddingTop: 80,
    paddingHorizontal: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 5,
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
