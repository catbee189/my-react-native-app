import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import Navbar from './Navbar';
import BottomBar from './BottomBar';

function ApprovedBookingsScreen({ route }) {
  const { user } = route.params || {};
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('approved');

  useEffect(() => {
    const fetchMergedBookings = async () => {
      if (!user?.member_id) {
        setBookings([]);
        setFilteredBookings([]);
        setLoading(false);
        return;
      }

      try {
        const [requestsSnapshot, schedulesSnapshot] = await Promise.all([
          getDocs(collection(db, 'request_bookings')),
          getDocs(collection(db, 'schedules')),
        ]);

        const scheduleMap = {};
        schedulesSnapshot.docs.forEach(doc => {
          scheduleMap[doc.id] = { id: doc.id, ...doc.data() };
        });

        const merged = requestsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(req => req.member_id === user?.member_id)
          .map(req => {
            const relatedSchedule = scheduleMap[req.schedule_id] || {};
            return {
              ...req,
              schedule_status: relatedSchedule.status,
              schedule_start_time: relatedSchedule.start_time,
              schedule_end_time: relatedSchedule.end_time,
              schedule_location: relatedSchedule.location,
              schedule_title: relatedSchedule.title,
              assigned_pastor: relatedSchedule.assigned_pastor || req.assigned_pastor || 'N/A',
            };
          });

        setBookings(merged);
        applyFilter(merged, statusFilter);
      } catch (error) {
        console.error('Error fetching merged bookings:', error);
        Alert.alert('Error', 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchMergedBookings();
  }, []);

  const applyFilter = (data, status) => {
    const filtered = data.filter(
      item =>
        // ✅ STRICT match — only bookings with the selected status are shown
        (item.status === status && item.status) ||
        (item.schedule_status === status && item.schedule_status)
    );
    setFilteredBookings(filtered);
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    applyFilter(bookings, status);
  };

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

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>Church: {item.church_name}</Text>
      <Text>Member Name: {item.member_name}</Text>
      <Text>Email: {item.member_email}</Text>
      <Text>Contact: {item.member_contact}</Text>
      <Text>Address: {item.member_address}</Text>
      <Text>Purok: {item.member_purok}</Text>
      <Text>Number of Members: {item.number_of_members}</Text>
      <Text>Title: {item.schedule_title}</Text>
      <Text>Location: {item.schedule_location || item.location}</Text>
      <Text>Start Time: {formatDate(item.schedule_start_time || item.start_time)}</Text>
      <Text>End Time: {formatDate(item.schedule_end_time || item.end_time)}</Text>
      <Text>Status: {item.schedule_status || item.status}</Text>
      <Text>Assigned Pastor: {item.assigned_pastor}</Text>
      <Text>Submitted: {formatDate(item.created_at)}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Navbar user={user} />
      <Text style={styles.header}>My Booking History</Text>

      {!user?.member_id ? (
        <Text style={styles.empty}>⚠️ You must be logged in to view bookings.</Text>
      ) : (
        <>
          <View style={styles.filterContainer}>
            {['pending', 'approved', 'rejected'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  statusFilter === status && styles.activeFilterButton,
                ]}
                onPress={() => handleFilterChange(status)}
              >
                <Text
                  style={[
                    styles.filterText,
                    statusFilter === status && styles.activeFilterText,
                  ]}
                >
                  {status.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#007bff" />
          ) : (
            <FlatList
              data={filteredBookings}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={styles.empty}>No {statusFilter} bookings found.</Text>
              }
            />
          )}
        </>
      )}

      <BottomBar user={user} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#007bff',
    borderRadius: 20,
    marginHorizontal: 5,
  },
  activeFilterButton: {
    backgroundColor: '#007bff',
  },
  filterText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  activeFilterText: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#e9f0ff',
    padding: 15,
    marginBottom: 15,
    marginHorizontal: 15,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  empty: {
    textAlign: 'center',
    color: '#666',
    marginTop: 50,
    fontSize: 16,
  },
  listContent: { paddingBottom: 80 },
});

export default ApprovedBookingsScreen;
