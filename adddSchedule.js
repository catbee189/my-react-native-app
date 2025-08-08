  import React, { useState, useRef, useEffect } from 'react';
  import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Platform,
    Modal,
    Animated,
    Pressable,
    ActivityIndicator,
  } from 'react-native';
  import DateTimePicker from '@react-native-community/datetimepicker';
  import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
  import { db } from './firebase';
  import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
  import { Picker } from '@react-native-picker/picker'; // npm install @react-native-picker/picker
  import SidebarModal from './SidebarModal';
  import SidebarToggle from './SidebarToggle';
  export default function ScheduleInsert({ navigation }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [location, setLocation] = useState('');
    
    // Selected pastor user id
    const [selectedPastor, setSelectedPastor] = useState('');
    const [pastors, setPastors] = useState([]);
    const [loadingPastors, setLoadingPastors] = useState(true);

    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(false);

    // Fetch pastors with role 'pastor' from Firestore
    useEffect(() => {
      const fetchPastors = async () => {
        try {
          const q = query(collection(db, 'users'), where('role', '==', 'Pastor'));
          const querySnapshot = await getDocs(q);
          const pastorsList = [];
          querySnapshot.forEach((doc) => {
            pastorsList.push({ id: doc.id, ...doc.data() });
          });
          setPastors(pastorsList);
          // Default select first pastor if any
          if (pastorsList.length > 0) setSelectedPastor(pastorsList[0].id);
        } catch (error) {
          console.error('Error fetching pastors:', error);
          Alert.alert('Error', 'Failed to load pastors');
        } finally {
          setLoadingPastors(false);
        }
      };

      fetchPastors();
    }, []);

    const showAlert = (title, message) => {
      Platform.OS === 'web' ? alert(`${title}: ${message}`) : Alert.alert(title, message);
    };

    const handleInsert = async () => {
      if (!title || !startTime || !endTime) {
        showAlert('Error', 'Please fill Title, Start Time and End Time');
        return;
      }
      if (!selectedPastor) {
        showAlert('Error', 'Please select a pastor');
        return;
      }

      try {
        await addDoc(collection(db, 'schedules'), {
          user_id: selectedPastor, // Insert selected pastor's id
          title,
          description,
          start_time: startTime,
          end_time: endTime,
          location,
         status: 'none', // Add this line
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        });

        showAlert('Success', 'Schedule inserted successfully!');

        // Clear form
        setTitle('');
        setDescription('');
        setStartTime(null);
        setEndTime(null);
        setLocation('');
        setSelectedPastor(pastors.length > 0 ? pastors[0].id : '');

        if (navigation?.getParam) {
          const refresh = navigation.getParam('refresh');
          if (refresh) refresh();
        } else if (navigation?.route?.params?.refresh) {
          navigation.route.params.refresh();
        }

        navigation.navigate('schedule');
      } catch (error) {
        console.error('Error inserting schedule:', error);
        showAlert('Error', 'Failed to insert schedule');
      }
    };

    const formatDateForInput = (date) => {
      if (!date) return '';
      const pad = (n) => (n < 10 ? '0' + n : n);
      return (
        date.getFullYear() +
        '-' +
        pad(date.getMonth() + 1) +
        '-' +
        pad(date.getDate()) +
        'T' +
        pad(date.getHours()) +
        ':' +
        pad(date.getMinutes())
      );
    };

    const onStartChange = (event, selectedDate) => {
      setShowStartPicker(false);
      if (selectedDate) setStartTime(selectedDate);
    };

    const onEndChange = (event, selectedDate) => {
      setShowEndPicker(false);
      if (selectedDate) setEndTime(selectedDate);
    };

    const onWebStartChange = (e) => setStartTime(new Date(e.target.value));
    const onWebEndChange = (e) => setEndTime(new Date(e.target.value));

    // Sidebar state
    const [menuVisible, setMenuVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(-250)).current;

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
      }).start(() => setMenuVisible(false));
    };

    return (
      <>
        <View style={styles.container}>
          {/* Top menu icon */}
        <SidebarToggle onOpen={() => setSidebarVisible(true)} />
      <SidebarModal visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
      


          <Text style={styles.heading}>Add Schedule</Text>

          <TextInput placeholder="Title *" style={styles.input} value={title} onChangeText={setTitle} />
          <TextInput placeholder="Description" style={styles.input} value={description} onChangeText={setDescription} />

          <Text style={styles.label}>Select Pastor *</Text>
          {loadingPastors ? (
            <ActivityIndicator size="small" color="#007bff" />
          ) : pastors.length === 0 ? (
            <Text>No pastors available</Text>
          ) : Platform.OS === 'web' ? (
            <select
              style={styles.webInput}
              value={selectedPastor}
              onChange={(e) => setSelectedPastor(e.target.value)}
            >
              {pastors.map((pastor) => (
                <option key={pastor.id} value={pastor.id}>
                  {pastor.name || pastor.role || 'Unnamed Pastor'}
                </option>
              ))}
            </select>
          ) : (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedPastor}
                onValueChange={(itemValue) => setSelectedPastor(itemValue)}
                style={styles.picker}
              >
                {pastors.map((pastor) => (
                  <Picker.Item
                    key={pastor.id}
                    label={pastor.fullName || pastor.email || 'Unnamed Pastor'}
                    value={pastor.id}
                  />
                ))}
              </Picker>
            </View>
          )}

          <Text style={styles.label}>Start Date</Text>
          {Platform.OS === 'web' ? (
            <input
              type="datetime-local"
              value={formatDateForInput(startTime)}
              onChange={onWebStartChange}
              style={styles.webInput}
            />
          ) : (
            <>
              <TouchableOpacity style={styles.input} onPress={() => setShowStartPicker(true)}>
                <Text>{startTime ? startTime.toLocaleString() : 'Select Start Date *'}</Text>
              </TouchableOpacity>
              {showStartPicker && (
                <DateTimePicker value={startTime || new Date()} mode="datetime" display="default" onChange={onStartChange} />
              )}
            </>
          )}

          <Text style={styles.label}>End Date</Text>
          {Platform.OS === 'web' ? (
            <input
              type="datetime-local"
              value={formatDateForInput(endTime)}
              onChange={onWebEndChange}
              style={styles.webInput}
            />
          ) : (
            <>
              <TouchableOpacity style={styles.input} onPress={() => setShowEndPicker(true)}>
                <Text>{endTime ? endTime.toLocaleString() : 'Select End Date *'}</Text>
              </TouchableOpacity>
              {showEndPicker && (
                <DateTimePicker value={endTime || new Date()} mode="datetime" display="default" onChange={onEndChange} />
              )}
            </>
          )}

          <TextInput placeholder="Location" style={styles.input} value={location} onChangeText={setLocation} />

          <TouchableOpacity style={styles.button} onPress={handleInsert}>
            <Text style={styles.buttonText}>Save Schedule</Text>
          </TouchableOpacity>
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
      </>
    );
  }

  const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 50, marginLeft: 40 },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 6,
      padding: 10,
      marginBottom: 12,
      justifyContent: 'center',
    },
    label: { fontWeight: 'bold', marginBottom: 4 },
    webInput: {
      width: '100%',
      padding: 10,
      fontSize: 16,
      marginBottom: 12,
      borderRadius: 6,
      borderColor: '#ccc',
      borderWidth: 1,
    },
    button: {
      backgroundColor: '#007bff',
      padding: 14,
      borderRadius: 6,
      alignItems: 'center',
      marginTop: 10,
    },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    menuIcon: { position: 'absolute', top: 20, left: 20, zIndex: 999 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', flexDirection: 'row' },
    sidebar: {
      width: 250,
      backgroundColor: '#fff',
      padding: 20,
      paddingTop: 50,
      height: '100%',
      elevation: 5,
    },
    profileSection: { marginBottom: 20 },
    profileRow: { flexDirection: 'row', alignItems: 'center' },
    profileName: { fontSize: 16, fontWeight: 'bold', marginRight: 8 },
    onlineBullet: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'green' },
    profileStatus: { fontSize: 12, color: '#555' },
    sidebarButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    icon: { marginRight: 10 },
    sidebarItemText: { fontSize: 15 },

    pickerContainer: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 6,
    







  marginBottom: 12,
  },
  picker: {
  height: 40,
  width: '100%',
  },
  });