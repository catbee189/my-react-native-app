import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import SidebarModal from './SidebarModal';
import SidebarToggle from './SidebarToggle';

const CombinedScheduleScreen = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const navigation = useNavigation();

  // Fetch approved bookings
const fetchData = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'schedules'));

    const approvedItems = await Promise.all(
      snapshot.docs
        .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
        .filter((item) => item.status?.toLowerCase() === 'approved')
        .map(async (data) => ({
          id: data.id,
          title: data.title || 'No Title',
          churchName: data.church_name || 'No Church',
          location: data.location || 'No Location',
          description: data.description || 'No Description',
          numberOfMembers: data.numberOfMembers || 'N/A',
          startTime:
            data.start_time?.toDate?.() || new Date(data.start_time) || new Date(),
          endTime:
            data.end_time?.toDate?.() || new Date(data.end_time) || new Date(),
          status: data.status || 'Unknown',
          assignedPastor: data.assigned_pastor || 'Unassigned',
          memberName: data.member_name || 'No Member',
        }))
    );

    approvedItems.sort((a, b) => b.startTime - a.startTime);
    setItems(approvedItems);
  } catch (error) {
    console.error('Error fetching approved visit schedules:', error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchData();
  }, []);

  // Render card for each booking
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Church:</Text>
        <Text style={styles.value}>{item.churchName}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Location:</Text>
        <Text style={styles.value}>{item.location}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Pastor:</Text>
        <Text style={styles.value}>{item.assignedPastor}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Member:</Text>
        <Text style={styles.value}>{item.memberName}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Start:</Text>
        <Text style={styles.value}>{item.startTime.toLocaleString()}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>End:</Text>
        <Text style={styles.value}>{item.endTime.toLocaleString()}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Status:</Text>
        <Text style={[styles.value, styles.statusApproved]}>{item.status}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Description:</Text>
        <Text style={styles.value}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <SidebarToggle onOpen={() => setSidebarVisible(true)} />
      <SidebarModal visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No approved bookings found.</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loader: {
    marginTop: 50,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  label: {
    fontWeight: '600',
    color: '#334155',
    marginRight: 6,
  },
  value: {
    color: '#475569',
    flexShrink: 1,
  },
  statusApproved: {
    color: '#22c55e',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#94a3b8',
  },
});

export default CombinedScheduleScreen;
