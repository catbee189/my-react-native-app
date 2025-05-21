import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import SidebarModal from './SidebarModal';
import SidebarToggle from './SidebarToggle';

const CombinedScheduleScreen = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(false); // ✅ FIXED

  const navigation = useNavigation();

  // ✅ Fetch user name by userId
  const fetchUserName = async (userId) => {
    if (!userId) return 'Unknown';
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return data.name || 'No Name';
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
    return 'No Name';
  };

  // ✅ Fetch Visit Schedule Data
  const fetchData = async () => {
    try {
      const visitsSnap = await getDocs(collection(db, 'Visit_Schedules'));
      const visits = await Promise.all(
        visitsSnap.docs.map(async (docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            type: 'visit',
            pastorName: await fetchUserName(data.pastor_id),
            memberName: await fetchUserName(data.member_id),
            visitDate: new Date(data.visit_date),
            visitNotes: data.visit_notes || '',
            status: data.status || '',
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
          };
        })
      );
      visits.sort((a, b) => b.visitDate - a.visitDate);
      setItems(visits);
    } catch (error) {
      console.error('Error fetching visit schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Render each schedule card
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>Visit Schedule</Text>
      <Text>Pastor: {item.pastorName}</Text>
      <Text>Member: {item.memberName}</Text>
      <Text>Date: {item.visitDate.toLocaleDateString()}</Text>
      <Text>Notes: {item.visitNotes}</Text>
      <Text>Status: {item.status}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* ✅ Sidebar Trigger */}
      <SidebarToggle onOpen={() => setSidebarVisible(true)} />
      <SidebarModal visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {/* ✅ Loading or Data List */}
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.container}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: '#e2e8f0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    marginTop: 20,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
});

export default CombinedScheduleScreen;
