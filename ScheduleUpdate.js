import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  Modal,
  Pressable,
  Animated,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { db } from './firebase';
import { doc, getDoc, updateDoc, addDoc, collection, Timestamp } from 'firebase/firestore';
import SidebarModal from './SidebarModal';
import SidebarToggle from './SidebarToggle';
export default function ScheduleInsert({ route, navigation }) {
  const { scheduleId, refresh } = route.params || {};

  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Schedule form states
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');

  // Sidebar modal visibility & animation
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-250)).current; // sidebar width approx 250

  // Fetch existing data if editing
  useEffect(() => {
    const fetchSchedule = async () => {
      if (scheduleId) {
        const docRef = doc(db, 'schedules', scheduleId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title || '');
          setStartTime(data.start_time?.toDate()?.toISOString()?.slice(0, 16) || '');
          setEndTime(data.end_time?.toDate()?.toISOString()?.slice(0, 16) || '');
          setLocation(data.location || '');
        }
      }
    };
    fetchSchedule();
  }, [scheduleId]);

  // Open sidebar animation
  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Close sidebar animation
  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -250,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setMenuVisible(false);
    });
  };

  // Save handler for schedule form
  const handleSave = async () => {
    try {
      if (!title || !startTime || !endTime) {
        Alert.alert('Validation', 'Title, Start, and End time are required');
        return;
      }

      const data = {
        title,
        start_time: Timestamp.fromDate(new Date(startTime)),
        end_time: Timestamp.fromDate(new Date(endTime)),
        location,
      };

      if (scheduleId) {
        // Update existing schedule
        await updateDoc(doc(db, 'schedules', scheduleId), data);
        if (Platform.OS === 'web') {
          alert('Schedule updated');
        } else {
          Alert.alert('Updated', 'Schedule updated successfully');
        }
      } else {
        // Insert new schedule
        await addDoc(collection(db, 'schedules'), data);
        if (Platform.OS === 'web') {
          alert('Schedule added');
        } else {
          Alert.alert('Added', 'Schedule added successfully');
        }
      }

      if (refresh) refresh(); // refresh list
      navigation.goBack();
    } catch (error) {
      console.error('Error saving:', error);
      if (Platform.OS === 'web') {
        alert('Save failed');
      } else {
        Alert.alert('Error', 'Failed to save schedule');
      }
    }
  };

  return (
    <View style={styles.container}>

      {/* Menu button */}
  <SidebarToggle onOpen={() => setSidebarVisible(true)} />
     <SidebarModal visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
     

      <Text style={styles.heading}>{scheduleId ? 'Edit Schedule' : 'Add Schedule'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.input}
        placeholder="Start Time (YYYY-MM-DDTHH:MM)"
        value={startTime}
        onChangeText={setStartTime}
      />

      <TextInput
        style={styles.input}
        placeholder="End Time (YYYY-MM-DDTHH:MM)"
        value={endTime}
        onChangeText={setEndTime}
      />

      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>{scheduleId ? 'Update' : 'Save'}</Text>
      </TouchableOpacity>

      {/* Sidebar modal */}
      <Modal
        transparent={true}
        visible={menuVisible}
        animationType="none"
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.modalOverlay} onPress={closeMenu}>
          <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.profileSection}>
              <View style={styles.profileRow}>
                <Text style={styles.profileName}>Pastor John</Text>
                <View style={styles.onlineBullet} />
              </View>
              <Text style={styles.profileStatus}>Online</Text>
            </View>

            <TouchableOpacity
              style={styles.sidebarButton}
              onPress={() => {
                closeMenu();
                navigation.navigate('ManagerUser');
              }}
            >
              <Ionicons name="person-outline" size={20} color="#555" style={styles.icon} />
              <Text style={styles.sidebarItemText}>Manager User</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sidebarButton}
              onPress={() => {
                closeMenu();
                navigation.navigate('schedule');
              }}
            >
              <MaterialIcons name="schedule" size={20} color="#555" style={styles.icon} />
              <Text style={styles.sidebarItemText}>Schedule of Manager</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sidebarButton}
              onPress={() => {
                closeMenu();
                navigation.navigate('booking');
              }}
            >
              <MaterialIcons name="event-available" size={20} color="#555" style={styles.icon} />
              <Text style={styles.sidebarItemText}>Appointment Booking</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sidebarButton}
              onPress={() => {
                closeMenu();
                navigation.navigate('visit');
              }}
            >
              <FontAwesome5 name="calendar-check" size={18} color="#555" style={styles.icon} />
              <Text style={styles.sidebarItemText}>Visit Schedule</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sidebarButton}
              onPress={() => {
                closeMenu();
                navigation.navigate('divition');
              }}
            >
              <Ionicons name="book-outline" size={20} color="#555" style={styles.icon} />
              <Text style={styles.sidebarItemText}>Prayer & Devotion Tracker</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sidebarButton, { marginTop: 20 }]}
              onPress={() => {
                closeMenu();
                navigation.navigate('Login');
              }}
            >
              <MaterialIcons name="logout" size={20} color="#D9534F" style={styles.icon} />
              <Text style={[styles.sidebarItemText, { color: '#D9534F' }]}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  menuButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 60, // to avoid menu button overlap
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    borderRadius: 5,
    padding: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // Sidebar styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    flexDirection: 'row',
  },
  sidebar: {
    width: 250,
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 3, height: 0 },
    shadowRadius: 10,
    elevation: 5,
  },
  profileSection: {
    marginBottom: 30,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileName: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  onlineBullet: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'green',
  },
  profileStatus: {
    color: 'green',
    marginTop: 5,
  },
  sidebarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  sidebarItemText: {
    fontSize: 16,
    color: '#555',
  },
});
