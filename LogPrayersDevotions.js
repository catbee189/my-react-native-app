import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import Navbar from './Navbar';
import BottomBar from './BottomBar';

export default function ViewPrayerDevotions({ route   }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
const { user } = route.params;
 useEffect(() => {
  const fetchData = async () => {
    try {
      const q = query(
        collection(db, 'prayer_devotion_tracker'),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(q);
      const allEntries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const userEntries = allEntries.filter(entry =>
        entry.user_id === user.id || entry.member_id === user.id
      );

      setEntries(userEntries);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [user]);


  return (
    <>
       <Navbar user={user} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Prayer & Devotion Entries</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#007aff" />
        ) : entries.length === 0 ? (
          <Text style={styles.noDataText}>No entries found.</Text>
        ) : (
          entries.map((entry, index) => (
            <View key={entry.id || index} style={styles.card}>
              <Text style={styles.date}>{entry.date}</Text>
              <Text style={styles.label}>Devotion</Text>
              <Text style={styles.text}>{entry.devotion_text}</Text>
              <Text style={styles.label}>Prayer</Text>
              <Text style={styles.text}>{entry.prayer_text}</Text>
              <Text style={styles.userId}>By: {entry.user_id}</Text>
            </View>
          ))
        )}
      </ScrollView>
       <BottomBar user={user} />  
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    minHeight: '100%',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  noDataText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  date: {
    fontSize: 14,
    color: '#007aff',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  label: {
    fontWeight: '600',
    color: '#555',
    marginTop: 10,
  },
  text: {
    color: '#333',
    fontSize: 15,
    marginTop: 4,
  },
  userId: {
    marginTop: 12,
    fontSize: 13,
    color: '#999',
    textAlign: 'right',
    fontStyle: 'italic',
  },
});
