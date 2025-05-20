import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  Pressable,
  Animated,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons'; // or react-native-vector-icons
import { db } from './firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

// Detect if running on web
const isWeb = Platform.OS === 'web';

const BookingListScreen = ({ navigation }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state for visit schedule
  const [visitModalVisible, setVisitModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [visitDate, setVisitDate] = useState('');
  const [visitNotes, setVisitNotes] = useState('');
  const [savingVisit, setSavingVisit] = useState(false);

  // Sidebar modal state and animation
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-300)).current; // Start off-screen

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const appointmentSnapshot = await getDocs(collection(db, 'appointments'));
        const appointmentData = appointmentSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const detailedData = await Promise.all(
          appointmentData.map(async (appointment) => {
            let memberName = null;
            let pastorName = null;
            let scheduleInfo = null;
            let Titlename = null;
            let location = null;

            const formatDate = (timestamp) => {
              if (timestamp?.seconds) {
                const date = new Date(timestamp.seconds * 1000);
                return new Intl.DateTimeFormat('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: '2-digit',
                }).format(date);
              }
              return null;
            };

            if (appointment.member_id) {
              const memberDoc = await getDoc(doc(db, 'users', appointment.member_id));
              if (memberDoc.exists()) {
                memberName = memberDoc.data().fullName || memberDoc.data().name || null;
              }
            }

            if (appointment.pastor_id) {
              const pastorDoc = await getDoc(doc(db, 'users', appointment.pastor_id));
              if (pastorDoc.exists()) {
                pastorName = pastorDoc.data().fullName || pastorDoc.data().name || null;
              }
            }

            if (appointment.schedule_id) {
              const scheduleDoc = await getDoc(doc(db, 'schedules', appointment.schedule_id));
              if (scheduleDoc.exists()) {
                const scheduleData = scheduleDoc.data();
                Titlename = scheduleData.title || null;
                location = scheduleData.location || null;
                const start = formatDate(scheduleData.start_time);
                const end = formatDate(scheduleData.end_time);
                if (start && end) {
                  scheduleInfo = `${start} to ${end}`;
                }
              }
            }

            return {
              ...appointment,
              appointment_id: appointment.appointment_id || appointment.id,
              Titlename,
              memberName,
              pastorName,
              scheduleInfo,
              location,
              start_date: formatDate(appointment.start_date),
              end_date: formatDate(appointment.end_date),
              created_at: formatDate(appointment.created_at),
            };
          })
        );

        const approvedAppointments = detailedData.filter(
          (appt) => appt.status === 'Approved'
        );

        setAppointments(approvedAppointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        if (isWeb) {
          alert('Failed to fetch appointments');
        } else {
          Alert.alert('Error', 'Failed to fetch appointments');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Sidebar open/close handlers
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
      toValue: -300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setMenuVisible(false);
    });
  };

  // Visit modal handlers (unchanged)
  const openVisitModal = (appointment) => {
    setSelectedAppointment(appointment);
    setVisitDate('');
    setVisitNotes('');
    setVisitModalVisible(true);
  };

  const closeVisitModal = () => {
    setVisitModalVisible(false);
    setSelectedAppointment(null);
  };

  const saveVisitSchedule = async () => {
    if (!visitDate.trim()) {
      if (isWeb) alert('Please enter visit date');
      else Alert.alert('Validation', 'Please enter visit date');
      return;
    }

    if (!visitNotes.trim()) {
      if (isWeb) alert('Please enter visit notes');
      else Alert.alert('Validation', 'Please enter visit notes');
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(visitDate.trim())) {
      if (isWeb) alert('Visit date must be in format YYYY-MM-DD');
      else Alert.alert('Validation', 'Visit date must be in format YYYY-MM-DD');
      return;
    }

    setSavingVisit(true);

    try {
      await addDoc(collection(db, 'Visit_Schedules'), {
        member_id: selectedAppointment.member_id || '',
        pastor_id: selectedAppointment.pastor_id || '',
        status: 'Pending',
        visit_date: visitDate.trim(),
        visit_notes: visitNotes.trim(),
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        appointment_id: selectedAppointment.appointment_id || selectedAppointment.id,
      });

      if (isWeb) alert('Visit added successfully!');
      else Alert.alert('Success', 'Visit added successfully!');
      closeVisitModal();
    } catch (error) {
      console.error('Error saving visit schedule:', error);
      if (isWeb) alert('Failed to add visit schedule');
      else Alert.alert('Error', 'Failed to add visit schedule');
    } finally {
      setSavingVisit(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => openVisitModal(item)}
      style={styles.card}
      activeOpacity={0.8}
    >
      <Text style={styles.title}>Appointment Name: {item.Titlename}</Text>
      <Text>Member: {item.memberName}</Text>
      <Text>Pastor: {item.pastorName}</Text>
      <Text>Schedule: {item.scheduleInfo}</Text>
      {item.location && <Text>Location: {item.location}</Text>}
      {item.start_date && <Text>Start Date: {item.start_date}</Text>}
      {item.end_date && <Text>End Date: {item.end_date}</Text>}
      {item.notes && <Text>Notes: {item.notes}</Text>}
      {item.created_at && <Text>Created At: {item.created_at}</Text>}
      <Text style={{ marginTop: 10, fontWeight: 'bold', color: 'green' }}>
        Status: Approved
      </Text>
      <Text style={{ marginTop: 5, fontStyle: 'italic', color: '#555' }}>
        (Tap to add visit schedule)
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header with menu button */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={openMenu} style={styles.menuButton}>
          <Ionicons name="menu" size={30} color="#333" />
        </TouchableOpacity>
        <Text style={styles.header}>Approved Appointments</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.appointment_id || item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center' }}>No approved appointments.</Text>
          }
        />
      )}

      {/* Visit Modal (unchanged) */}
      <Modal
        visible={visitModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeVisitModal}
      >
        <View style={styles.visitModalOverlay}>
          <View style={styles.visitModalContent}>
            <Text style={styles.modalTitle}>Add New Visit</Text>

            <Text style={styles.inputLabel}>Visit Date (YYYY-MM-DD):</Text>

            {isWeb ? (
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                style={{
                  padding: 10,
                  fontSize: 16,
                  borderColor: '#999',
                  borderWidth: 1,
                  borderRadius: 5,
                  marginTop: 5,
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
            ) : (
              <TextInput
                placeholder="YYYY-MM-DD"
                value={visitDate}
                onChangeText={setVisitDate}
                style={[styles.textInput, { marginTop: 5 }]}
              />
            )}

            <Text style={styles.inputLabel}>Visit Notes:</Text>
            <TextInput
              placeholder="Enter notes"
              value={visitNotes}
              onChangeText={setVisitNotes}
              style={[styles.textInput, { height: 80 }]}
              multiline
            />

            <View style={{ flexDirection: 'row', marginTop: 15 }}>
              <TouchableOpacity
                onPress={saveVisitSchedule}
                style={[styles.button, { backgroundColor: 'green', flex: 1 }]}
                disabled={savingVisit}
              >
                <Text style={styles.buttonText}>
                  {savingVisit ? 'Saving...' : 'Add Visit'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={closeVisitModal}
                style={[styles.button, { backgroundColor: 'red', marginLeft: 10, flex: 1 }]}
                disabled={savingVisit}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sidebar Modal */}
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
              <MaterialIcons
                name="event-available"
                size={20}
                color="#555"
                style={styles.icon}
              />
              <Text style={styles.sidebarItemText}>Appointment Booking</Text>
            </TouchableOpacity>

            <






TouchableOpacity
style={styles.sidebarButton}
onPress={() => {
closeMenu();
navigation.navigate('DevotionPrayer');
}}
>
<FontAwesome5 name="pray" size={20} color="#555" style={styles.icon} />
<Text style={styles.sidebarItemText}>Prayer & Devotion Tracker</Text>
</TouchableOpacity>
</Animated.View>
</Pressable>
</Modal>
</View>
);
};

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#f5f5f5',
},
headerBar: {
flexDirection: 'row',
alignItems: 'center',
backgroundColor: '#eee',
padding: 10,
},
menuButton: {
marginRight: 15,
},
header: {
fontSize: 20,
fontWeight: 'bold',
color: '#333',
},
card: {
backgroundColor: '#fff',
borderRadius: 8,
padding: 15,
margin: 10,
elevation: 2,
},
title: {
fontWeight: 'bold',
fontSize: 16,
marginBottom: 6,
},
visitModalOverlay: {
flex: 1,
backgroundColor: 'rgba(0,0,0,0.5)',
justifyContent: 'center',
padding: 20,
},
visitModalContent: {
backgroundColor: 'white',
borderRadius: 8,
padding: 20,
},
modalTitle: {
fontSize: 20,
fontWeight: 'bold',
marginBottom: 15,
},
inputLabel: {
fontWeight: '600',
marginTop: 10,
},
textInput: {
borderWidth: 1,
borderColor: '#999',
borderRadius: 5,
padding: 10,
fontSize: 16,
},
button: {
borderRadius: 5,
padding: 12,
alignItems: 'center',
},
buttonText: {
color: 'white',
fontWeight: 'bold',
},

// Sidebar styles
modalOverlay: {
flex: 1,
backgroundColor: 'rgba(0,0,0,0.4)',
flexDirection: 'row',
},
sidebar: {
width: 280,
backgroundColor: 'white',
paddingTop: 40,
paddingHorizontal: 15,
shadowColor: '#000',
shadowOffset: { width: 4, height: 0 },
shadowOpacity: 0.3,
shadowRadius: 8,
elevation: 8,
zIndex: 10,
},
profileSection: {
marginBottom: 30,
},
profileRow: {
flexDirection: 'row',
alignItems: 'center',
},
profileName: {
fontWeight: 'bold',
fontSize: 18,
},
onlineBullet: {
width: 12,
height: 12,
backgroundColor: 'green',
borderRadius: 6,
marginLeft: 10,
},
profileStatus: {
fontSize: 12,
color: 'green',
marginTop: 4,
},
sidebarButton: {
flexDirection: 'row',
alignItems: 'center',
paddingVertical: 14,
borderBottomColor: '#ddd',
borderBottomWidth: 1,
},
icon: {
marginRight: 15,
},
sidebarItemText: {
fontSize: 16,
color: '#555',
},
});

export default BookingListScreen;