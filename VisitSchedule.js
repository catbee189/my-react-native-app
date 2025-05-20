import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, StyleSheet, Modal,
  Pressable, TouchableOpacity, Animated
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const CombinedScheduleScreen = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const navigation = useNavigation();

  // Fetch user name by userId
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
      <TouchableOpacity onPress={openMenu} style={styles.menuButton}>
        <Ionicons name="menu" size={30} color="#333" />
      </TouchableOpacity>

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
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: '#e2e8f0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    marginTop:100,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  smallText: {
    color: '#555',
    fontSize: 12,
  },
  menuButton: {
    padding: 10,
    position: 'absolute',
    top: 40,
    left: 10,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    flexDirection: 'row',
  },
  sidebar: {
    width: 250,
    backgroundColor: '#fff',
    padding: 16,
    paddingTop: 60,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  profileSection: {
    marginBottom: 30,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileStatus: {
    fontSize: 14,
    color: 'green',
  },
  sidebarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sidebarItemText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default CombinedScheduleScreen;
