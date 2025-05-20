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
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { db } from './firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';

const BookingListScreen = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sidebar animation states
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const navigation = useNavigation();

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
    }).start(() => setMenuVisible(false));
  };

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

        const pendingAppointments = detailedData.filter(
          (appt) =>
            appt.status === 'pending' &&
            appt.memberName &&
            appt.pastorName &&
            appt.scheduleInfo &&
            appt.Titlename
        );

        setAppointments(pendingAppointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        Alert.alert('Error', 'Failed to fetch appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const confirmApprove = (id) => {
  if (Platform.OS === 'web') {
    if (window.confirm('Are you sure you want to approve this appointment?')) {
      handleApprove(id);
    }
  } else {
    Alert.alert('Approve Appointment', 'Are you sure you want to approve this appointment?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', onPress: () => handleApprove(id) },
    ]);
  }
};

const confirmReject = (id) => {
  if (Platform.OS === 'web') {
    if (window.confirm('Are you sure you want to reject this appointment?')) {
      handleReject(id);
    }
  } else {
    Alert.alert('Reject Appointment', 'Are you sure you want to reject this appointment?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', onPress: () => handleReject(id) },
    ]);
  }
};

const handleApprove = async (id) => {
  try {
    await updateDoc(doc(db, 'appointments', id), { status: 'Approved' });
    Alert.alert('Success', 'Appointment approved!');
    setAppointments((prev) => prev.filter((item) => item.id !== id));
  } catch (error) {
    Alert.alert('Error', 'Failed to approve appointment');
  }
};

const handleReject = async (id) => {
  try {
    await updateDoc(doc(db, 'appointments', id), { status: 'Rejected' });
    Alert.alert('Success', 'Appointment rejected!');
    setAppointments((prev) => prev.filter((item) => item.id !== id));
  } catch (error) {
    Alert.alert('Error', 'Failed to reject appointment');
  }
};

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>Appointment Name: {item.Titlename}</Text>
      <Text>Member: {item.memberName}</Text>
      <Text>Pastor: {item.pastorName}</Text>
      <Text>Schedule: {item.scheduleInfo}</Text>
      {item.location && <Text>Location: {item.location}</Text>}
      {item.start_date && <Text>Start Date: {item.start_date}</Text>}
      {item.end_date && <Text>End Date: {item.end_date}</Text>}
      {item.notes && <Text>Notes: {item.notes}</Text>}

      <View style={styles.actionButtons}>
      <TouchableOpacity
  style={[styles.button, styles.approveButton]}
  onPress={() => confirmApprove(item.id)}
>
  <Text style={styles.buttonText}>Approve</Text>
</TouchableOpacity>



        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={() => confirmReject(item.id)}
        >
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
      </View>
      {item.created_at && <Text>Created At: {item.created_at}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuButton} onPress={openMenu}>
        <Ionicons name="menu" size={28} color="black" />
      </TouchableOpacity>

      <Text style={styles.header}>Pending Appointments</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.appointment_id || item.id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={{ textAlign: 'center' }}>No pending appointments.</Text>}
        />
      )}

      {/* Sidebar Modal */}
      <Modal transparent={true} visible={menuVisible} animationType="none" onRequestClose={closeMenu}>
        <Pressable style={styles.modalOverlay} onPress={closeMenu}>
          <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.profileSection}>
              <Text style={styles.profileName}>Pastor John</Text>
              <Text style={styles.profileStatus}>Online</Text>
            </View>

            <TouchableOpacity style={styles.sidebarButton} onPress={() => { closeMenu(); navigation.navigate("ManagerUser"); }}>
              <Ionicons name="person-outline" size={20} color="#555" />
              <Text style={styles.sidebarItemText}>Manager User</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sidebarButton} onPress={() => { closeMenu(); navigation.navigate("schedule"); }}>
              <MaterialIcons name="schedule" size={20} color="#555" />
              <Text style={styles.sidebarItemText}>Schedule of Manager</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sidebarButton} onPress={() => { closeMenu(); navigation.navigate("booking"); }}>
              <MaterialIcons name="event-available" size={20} color="#555" />
              <Text style={styles.sidebarItemText}>Appointment Booking</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sidebarButton} onPress={() => { closeMenu(); navigation.navigate("visit"); }}>
              <FontAwesome5 name="calendar-check" size={18} color="#555" />
              <Text style={styles.sidebarItemText}>Visit Schedule</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sidebarButton} onPress={() => { closeMenu(); navigation.navigate("divition"); }}>
              <Ionicons name="book-outline" size={20} color="#555" />
              <Text style={styles.sidebarItemText}>Prayer & Devotion Tracker</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, paddingHorizontal: 20 },
  menuButton: { position: 'absolute', top: 40, left: 20, zIndex: 10 },
  header: { fontSize: 24, fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
  card: {
    backgroundColor: '#f0f4ff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  title: { fontSize: 16, fontWeight: 'bold' },
  actionButtons: { flexDirection: 'row', marginTop: 10 },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  approveButton: { backgroundColor: 'green' },
  rejectButton: { backgroundColor: 'red' },
  buttonText: { color: 'white', fontWeight: 'bold' },

  // Sidebar styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', flexDirection: 'row' },
  sidebar: {
    width: 250,
    backgroundColor: '#fff',
    padding: 20,
    height: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 0 },
    elevation: 5,
  },
  profileSection: { marginBottom: 30 },
  profileName: { fontSize: 18, fontWeight: 'bold' },
  profileStatus: { color: 'green' },
  sidebarButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sidebarItemText: { marginLeft: 10, fontSize: 16 },
});

export default BookingListScreen;
