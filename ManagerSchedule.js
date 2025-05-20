import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

export default function ScheduleList({ navigation }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'schedules'));
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
    let d = date;
    if (date.toDate) d = date.toDate();
    return d.toLocaleString();
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Back to Dashboard Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#6c757d', marginBottom: 10 }]}
          onPress={() => navigation.navigate('dashboard')}
        >
          <Text style={styles.buttonText}>← Back to Dashboard</Text>
        </TouchableOpacity>

        {/* Add New Schedule Button */}
        <TouchableOpacity
          style={[styles.button, { marginBottom: 20 }]}
          onPress={() => navigation.navigate('adddSchedule')}
        >
          <Text style={styles.buttonText}>Add New Schedule</Text>
        </TouchableOpacity>

        {/* Schedule List */}
        {loading ? (
          <Text>Loading...</Text>
        ) : schedules.length === 0 ? (
          <Text>No schedules found.</Text>
        ) : (
          schedules.map((schedule) => (
            <View key={schedule.id} style={styles.card}>
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
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() =>
                    navigation.navigate('editschedule', {
                      scheduleId: schedule.id,
                      scheduleData: schedule,
                    })
                  }
                >
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => confirmDelete(schedule.id)}
                >
                  <Text style={styles.actionText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
});
