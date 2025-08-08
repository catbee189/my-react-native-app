import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import SidebarModal from './SidebarModal';
import SidebarToggle from './SidebarToggle';

export default function ScheduleList({ navigation }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Modal state for editing
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editSchedule, setEditSchedule] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
const querySnapshot = await getDocs(collection(db, 'members'));
    const schedulesArray = [];
      querySnapshot.forEach((docSnap) => {
        schedulesArray.push({ id: docSnap.id, ...docSnap.data() });
      });
      setSchedules(schedulesArray);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      Alert.alert('Error', 'Failed to load schedules');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const confirmDelete = (id) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to delete this schedule?');
      if (confirmed) deleteSchedule(id);
    } else {
      Alert.alert(
        'Delete Schedule',
        'Are you sure you want to delete this schedule?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteSchedule(id),
          },
        ]
      );
    }
  };

  const deleteSchedule = async (id) => {
    try {
      await deleteDoc(doc(db, 'schedules', id));
      Alert.alert('Deleted', 'Schedule deleted successfully');
      fetchSchedules();
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to delete schedule');
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    try {
      const d = typeof date.toDate === 'function' ? date.toDate() : new Date(date);
      return d.toLocaleString();
    } catch (err) {
      return '-';
    }
  };

  // Open modal and prefill data for editing
  const openEditModal = (schedule) => {
    setEditSchedule({
      id: schedule.id,
      title: schedule.title || '',
      location: schedule.location || '',
      start_time:
        schedule.start_time && typeof schedule.start_time.toDate === 'function'
          ? schedule.start_time.toDate().toISOString().slice(0, 16)
          : '',
      end_time:
        schedule.end_time && typeof schedule.end_time.toDate === 'function'
          ? schedule.end_time.toDate().toISOString().slice(0, 16)
          : '',
    });
    setEditModalVisible(true);
  };

  // Handle form input changes inside modal
  const handleChange = (field, value) => {
    setEditSchedule((prev) => ({ ...prev, [field]: value }));
  };

  // Update schedule in Firestore
  const updateSchedule = async () => {
    if (!editSchedule.title.trim()) {
      Alert.alert('Validation', 'Title is required');
      return;
    }

    setUpdateLoading(true);

    try {
      const scheduleRef = doc(db, 'schedules', editSchedule.id);
      await updateDoc(scheduleRef, {
        title: editSchedule.title,
        location: editSchedule.location,
        start_time: editSchedule.start_time ? new Date(editSchedule.start_time) : null,
        end_time: editSchedule.end_time ? new Date(editSchedule.end_time) : null,
      });
      Alert.alert('Success', 'Schedule updated successfully');
      setEditModalVisible(false);
      fetchSchedules();
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update schedule');
    }
    setUpdateLoading(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Sidebar */}
      <SidebarToggle onOpen={() => setSidebarVisible(true)} />
      <SidebarModal visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Add New Schedule */}
     

        {/* Schedule List */}
       <View style={styles.headerContainer}>
  <Text style={styles.headerText}>View Members</Text>
</View>

      {loading ? (
  <ActivityIndicator size="large" color="#007bff" />
) : schedules.length === 0 ? (
  <Text>No schedules found.</Text>
) : (
  schedules.map((schedule) => {
    const hasData =
      schedule.firstName ||
      schedule.lastName ||
      schedule.email ||
      schedule.address ||
      schedule.createdAt;

    if (!hasData) return null; // Skip rendering the card entirely

    return (
      <View key={schedule.id} style={styles.card}>
        {/* Fullname: Check if firstName or lastName exists */}
        {(schedule.firstName || schedule.lastName) && (
          <Text style={styles.text}>
            <Text style={styles.label}>Fullname:</Text> {schedule.firstName || ''} {schedule.lastName || ''}
          </Text>
        )}

        {/* Email */}
        {schedule.email && (
          <Text style={styles.text}>
            <Text style={styles.label}>Email:</Text> {schedule.email}
          </Text>
        )}

        {/* Address */}
        {schedule.address && (
          <Text style={styles.text}>
            <Text style={styles.label}>Address:</Text> {schedule.address}
          </Text>
        )}

        {/* Created At */}
        {schedule.createdAt && (
          <Text style={styles.text}>
            <Text style={styles.label}>Created At:</Text> {formatDate(schedule.createdAt)}
          </Text>
        )}
      </View>
    );
  })
)}

      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Schedule</Text>

            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.input}
              value={editSchedule?.title}
              onChangeText={(text) => handleChange('title', text)}
              placeholder="Schedule Title"
            />

            <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              style={styles.input}
              value={editSchedule?.location}
              onChangeText={(text) => handleChange('location', text)}
              placeholder="Location"
            />

            <Text style={styles.inputLabel}>Start Time</Text>
            <TextInput
              style={styles.input}
              value={editSchedule?.start_time}
              onChangeText={(text) => handleChange('start_time', text)}
              placeholder="YYYY-MM-DDTHH:mm"
            />

            <Text style={styles.inputLabel}>End Time</Text>
            <TextInput
              style={styles.input}
              value={editSchedule?.end_time}
              onChangeText={(text) => handleChange('end_time', text)}
              placeholder="YYYY-MM-DDTHH:mm"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, { flex: 1, marginRight: 10 }]}
                onPress={() => setEditModalVisible(false)}
                disabled={updateLoading}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { flex: 1, backgroundColor: '#28a745' }]}
                onPress={updateSchedule}
                disabled={updateLoading}
              >
                {updateLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    paddingBottom: 40,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#fafafa',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    marginBottom: 4,
  },
  label: {
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 5,
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: '#28a745',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  inputLabel: {
    fontWeight: '600',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginTop: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  headerContainer: {
  padding: 20,
  backgroundColor: '#f8f9fa',
  alignItems: 'center',
  borderBottomWidth: 1,
  borderBottomColor: '#ddd',
  marginBottom: 10,
},

headerText: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#333',
},

});
