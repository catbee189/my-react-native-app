import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,     // ✅ added
  doc,           // ✅ added
} from 'firebase/firestore';

import { db } from './firebase';

import Navbar from './Navbar';
import BottomBar from './BottomBar';

export default function ScheduleList({ route }) {
  const { user } = route.params || {};

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [memberAddress, setMemberAddress] = useState('');
  const [memberPurok, setMemberPurok] = useState('');
  const [churchName, setChurchName] = useState('');
  const [numberOfMembers, setNumberOfMembers] = useState('');
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberContact, setMemberContact] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    type: '',
    location: '',
    start_time: '',
    end_time: '',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'schedules'));
      const schedulesArray = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setSchedules(schedulesArray);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      Alert.alert('Error', 'Failed to load schedules');
    }
    setLoading(false);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    try {
      const d = typeof date.toDate === 'function' ? date.toDate() : new Date(date);
      return d.toLocaleString();
    } catch {
      return '-';
    }
  };

  const openBookingModal = (schedule) => {
    setSelectedSchedule(schedule);
    setBookingModalVisible(true);
  };

  const handleCreateSchedule = async () => {
    const { title, type, location, start_time, end_time } = newSchedule;
    if (!title || !type || !start_time || !end_time) {
      Alert.alert('Missing fields', 'Please fill all required fields');
      return;
    }
    try {
      setCreating(true);
      await addDoc(collection(db, 'schedules'), {
        title,
        type,
        status: 'pending',
        location,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        created_at: new Date(),
      });
      Alert.alert('Success', 'Schedule created');
      setCreateModalVisible(false);
      setNewSchedule({ title: '', type: '', location: '', start_time: '', end_time: '' });
      fetchSchedules();
    } catch (error) {
      console.error('Error creating schedule:', error);
      Alert.alert('Error', 'Failed to create schedule');
    } finally {
      setCreating(false);
    }
  };

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Navbar user={user} />
      <Text style={styles.header}> Available Church Events</Text>

      <ScrollView contentContainerStyle={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : schedules.length === 0 ? (
          <Text>No schedules found.</Text>
        ) : (
          schedules.map((schedule) => (
            <TouchableOpacity
              key={schedule.id}
              onPress={() => openBookingModal(schedule)}
              activeOpacity={0.85}
            >
              <View style={styles.card}>
                <Text style={styles.title}>{schedule.title}</Text>
                <Text style={styles.text}>
                  <Text style={styles.label}>Start:</Text> {formatDate(schedule.start_time)}
                </Text>
                <Text style={styles.text}>
                  <Text style={styles.label}>End:</Text> {formatDate(schedule.end_time)}
                </Text>
                <Text style={styles.text}>
                  <Text style={styles.label}>Location:</Text> {schedule.location || '-'}
                </Text>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    onPress={() => {
                      if (schedule.status !== 'approved') {
                        openBookingModal(schedule);
                        setMemberModalVisible(true);
                      }
                    }}
                    disabled={schedule.status === 'approved'}
                    style={{
                      backgroundColor: schedule.status === 'approved' ? '#999' : '#007bff',
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      marginTop: 10,
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
                      {schedule.status === 'approved' ? 'Booked' : 'Book Schedule'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setCreateModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Member Modal */}
      <Modal
        visible={memberModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMemberModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Member Details</Text>

            <ScrollView>
              <TextInput placeholder="Full Name" style={styles.input} value={memberName} onChangeText={setMemberName} />
              <TextInput placeholder="Email" style={styles.input} value={memberEmail} onChangeText={setMemberEmail} keyboardType="email-address" />
              <TextInput placeholder="Contact Number" style={styles.input} value={memberContact} onChangeText={setMemberContact} keyboardType="phone-pad" />
              <TextInput placeholder="Address" style={styles.input} value={memberAddress} onChangeText={setMemberAddress} />
              <TextInput placeholder="Purok" style={styles.input} value={memberPurok} onChangeText={setMemberPurok} />
              <TextInput placeholder="Church Name" style={styles.input} value={churchName} onChangeText={setChurchName} />
              <TextInput placeholder="How many members" style={styles.input} value={numberOfMembers} onChangeText={setNumberOfMembers} keyboardType="numeric" />
            </ScrollView>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#28a745' }]}
                onPress={async () => {
                  if (!selectedSchedule) return showAlert('Error', 'No schedule selected.');
                  if (!memberName || !memberEmail || !memberContact || !memberAddress || !memberPurok || !churchName || !numberOfMembers)
                    return showAlert('Missing Info', 'Please complete all fields before submitting.');

                  try {
                    await addDoc(collection(db, 'request_bookings'), {
                      schedule_id: selectedSchedule.id,
                      member_id: user?.member_id || '',
                      member_name: memberName,
                      member_email: memberEmail,
                      member_contact: memberContact,
                      member_address: memberAddress,
                      member_purok: memberPurok,
                      church_name: churchName,
                      count: 1,
                      number_of_members: numberOfMembers,
                      created_at: new Date(),
                    });

                    const scheduleRef = doc(db, 'schedules', selectedSchedule.id);
                    await updateDoc(scheduleRef, {
                      status: 'pending',
                    });

                    showAlert('Success', 'Your booking has been submitted!');
                    setMemberModalVisible(false);
                    setBookingModalVisible(false);
                    setMemberName('');
                    setMemberEmail('');
                    setMemberContact('');
                    setMemberAddress('');
                    setMemberPurok('');
                    setChurchName('');
                    setNumberOfMembers('');
                    fetchSchedules(); // ✅ Refresh list
                  } catch (error) {
                    console.error('Error booking:', error);
                    showAlert('Error', 'Failed to submit your booking.');
                  }
                }}
              >
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#dc3545' }]}
                onPress={() => setMemberModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Schedule Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Schedule</Text>
            <TextInput placeholder="Title" style={styles.input} value={newSchedule.title} onChangeText={(text) => setNewSchedule({ ...newSchedule, title: text })} />
            <TextInput placeholder="Type" style={styles.input} value={newSchedule.type} onChangeText={(text) => setNewSchedule({ ...newSchedule, type: text })} />
            <TextInput placeholder="Location" style={styles.input} value={newSchedule.location} onChangeText={(text) => setNewSchedule({ ...newSchedule, location: text })} />
            <TextInput placeholder="Start Time (YYYY-MM-DD HH:mm)" style={styles.input} value={newSchedule.start_time} onChangeText={(text) => setNewSchedule({ ...newSchedule, start_time: text })} />
            <TextInput placeholder="End Time (YYYY-MM-DD HH:mm)" style={styles.input} value={newSchedule.end_time} onChangeText={(text) => setNewSchedule({ ...newSchedule, end_time: text })} />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.button, { flex: 1, marginRight: 10 }]} onPress={() => setCreateModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { flex: 1, backgroundColor: '#28a745' }]} onPress={handleCreateSchedule} disabled={creating}>
                <Text style={styles.buttonText}>{creating ? 'Creating...' : 'Request Booking'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomBar user={user} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 60 },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#fafafa',
  },
  title: { fontWeight: 'bold', fontSize: 18, marginBottom: 6 },
  text: { fontSize: 14, marginBottom: 4 },
  label: { fontWeight: '600' },
  actionRow: { flexDirection: 'row', marginTop: 10, justifyContent: 'flex-end' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 10, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', marginTop: 20 },
  button: { backgroundColor: '#007bff', padding: 14, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 10 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    backgroundColor: '#007bff',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  header: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', marginTop: 20, marginBottom: 10, textAlign: 'center' },
});
