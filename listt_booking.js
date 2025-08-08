  import React, { useEffect, useState } from 'react';
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
  } from 'react-native';
  import { db } from './firebase';
  import {
    collection,
    getDocs,
    doc,
    updateDoc,
  } from 'firebase/firestore';
  import SidebarToggle from './SidebarToggle';
  import SidebarModal from './SidebarModal';

  const BookingRequestScreen = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarVisible, setSidebarVisible] = useState(false);

    const [assignModalVisible, setAssignModalVisible] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [pastorName, setPastorName] = useState('');
useEffect(() => {
  const fetchMergedBookings = async () => {
    try {
      const schedulesSnapshot = await getDocs(collection(db, 'schedules'));
      const requestsSnapshot = await getDocs(collection(db, 'request_bookings'));

      // Only include schedules with status 'pending'
      const scheduleMap = {};
      schedulesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.status === 'pending') {
          scheduleMap[doc.id] = { schedule_id: doc.id, ...data };
        }
      });

      // Only include requests tied to a pending schedule
      const filteredRequests = requestsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(req => scheduleMap[req.schedule_id]);

      // Merge the schedule info into the request
      const merged = filteredRequests.map(req => {
        const schedule = scheduleMap[req.schedule_id];
        return {
          ...req,
          ...(schedule || {}),
        };
      });

      setBookings(merged);
    } catch (error) {
      console.error('Error fetching merged bookings:', error);
      Alert.alert('Error', 'Failed to load booking requests');
    } finally {
      setLoading(false);
    }
  };

  fetchMergedBookings();
}, []);

    const formatDate = (timestamp) => {
      if (timestamp?.seconds) {
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      return 'N/A';
    };

    const openAssignModal = (bookingId) => {
      setSelectedBookingId(bookingId);
      setAssignModalVisible(true);
    };

const handleAssignPastor = async () => {
  if (!pastorName.trim()) {
    Alert.alert('Validation ⚠️', 'Please enter a pastor name');
    return;
  }

  try {
    const selectedBooking = bookings.find(b => b.id === selectedBookingId);
    const timestampNow = new Date();

    // ✅ Only update the schedules collection
    if (selectedBooking.schedule_id) {
      await updateDoc(doc(db, 'schedules', selectedBooking.schedule_id), {
        status: 'approved',
        assigned_pastor: pastorName.trim(), // optional if you want to store the pastor name
        updated_at: timestampNow,
      });

      // Update local UI (optional)
      setBookings((prev) => prev.filter((item) => item.id !== selectedBookingId));
      setAssignModalVisible(false);
      Alert.alert('Success ✅', `Pastor ${pastorName.trim()} has been assigned and schedule approved.`);
    } else {
      console.warn('No schedule_id found for booking:', selectedBookingId);
    }

    // Reset modal
    setPastorName('');
    setSelectedBookingId(null);
  } catch (error) {
    console.error('Error updating schedule:', error);
    Alert.alert('Error ❌', 'Failed to approve schedule.');
  }
};

const handleReject = async (schedule_id) => {
  try {
    const timestampNow = new Date();

    await updateDoc(doc(db, 'schedules', schedule_id), {
      status: 'rejected',
      updated_at: timestampNow, // optional timestamp
    });

    // Update UI
    setBookings((prev) => prev.filter((item) => item.schedule_id !== schedule_id));

    Alert.alert('Rejected ❌', 'Schedule has been rejected.');
  } catch (error) {
    console.error('Error rejecting schedule:', error);
    Alert.alert('Error ❌', 'Failed to reject schedule.');
  }
};

    const renderItem = ({ item }) => (
      <View style={styles.card}>
        <Text style={styles.title}>Church: {item.church_name}</Text>
        <Text>Member Name: {item.member_name}</Text>
        <Text>Email: {item.member_email}</Text>
        <Text>Contact: {item.member_contact}</Text>
        <Text>Address: {item.member_address}</Text>
        <Text>Purok: {item.member_purok}</Text>
        <Text>Number of Members: {item.number_of_members}</Text>
        <Text>Title: {item.title}</Text>
        <Text>Location: {item.location}</Text>
        <Text>Start Time: {formatDate(item.start_time)}</Text>
        <Text>End Time: {formatDate(item.end_time)}</Text>
        <Text>Status: {item.status}</Text>
        <Text>Submitted: {formatDate(item.created_at)}</Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.approveButton]}
            onPress={() => openAssignModal(item.id)}
          >
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.rejectButton]}
            onPress={() => handleReject(item.schedule_id)}
          >
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    );

    return (
      <View style={styles.container}>
        <SidebarToggle onOpen={() => setSidebarVisible(true)} />
        <SidebarModal visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

        <Text style={styles.header}>Pending Booking Requests</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListEmptyComponent={
              <Text style={styles.empty}>No valid pending bookings found.</Text>
            }
          />
        )}

        {/* Assign Pastor Modal */}
        <Modal
          visible={assignModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setAssignModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Assign Pastor</Text>
              <TextInput
                placeholder="Enter Pastor Name"
                style={styles.input}
                value={pastorName}
                onChangeText={setPastorName}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.approveButton]}
                  onPress={handleAssignPastor}
                >
                  <Text style={styles.buttonText}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.rejectButton]}
                  onPress={() => setAssignModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 50, paddingHorizontal: 15 },
    header: {
      fontSize: 22,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 15,
    },
    card: {
      backgroundColor: '#e9f0ff',
      padding: 15,
      marginBottom: 15,
      borderRadius: 8,
      borderColor: '#ccc',
      borderWidth: 1,
    },
    title: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
    actionButtons: { flexDirection: 'row', marginTop: 10 },
    button: {
      flex: 1,
      paddingVertical: 8,
      marginHorizontal: 5,
      borderRadius: 6,
      alignItems: 'center',
    },
    approveButton: { backgroundColor: '#28a745' },
    rejectButton: { backgroundColor: '#dc3545' },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    empty: { textAlign: 'center', color: '#666', marginTop: 50 },

    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: '#fff',
      width: '85%',
      padding: 20,
      borderRadius: 10,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
      textAlign: 'center',
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 10,
      marginBottom: 15,
      borderRadius: 6,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  });

  export default BookingRequestScreen;
