import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { db } from './firebase'; // Adjust the path as needed
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

const SCREEN_WIDTH = Dimensions.get('window').width;

const DashboardScreen = ({ navigation, route }) => {
  const user = route.params?.user || { name: 'Guest', role: 'N/A' };

  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH * 0.7)).current;

  // State for counts from Firestore
  const [counts, setCounts] = useState({
    totalUsers: 0,
    scheduleOfManager: 0,
    appointmentBooking: 0,
    visitSchedule: 0,
    prayerTracker: 0,
  });

  // Function to count documents in a collection
  const getCount = async (collectionName, condition = null) => {
    try {
      let q = collection(db, collectionName);
      if (condition) {
        q = query(q, where(...condition)); // condition example: ['status', '==', 'active']
      }
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error("Error fetching count for", collectionName, error);
      return 0;
    }
  };

  // Fetch all counts on component mount
  useEffect(() => {
    const fetchCounts = async () => {
      const [
        totalUsers,
        scheduleOfManager,
        appointmentBooking,
        visitSchedule,
        prayerTracker,
      ] = await Promise.all([
        getCount('users'),
        getCount('schedules'),
        getCount('appointments'),
        getCount('Visit_Schedules'),
        getCount('prayer_devotion_tracker'),
      ]);

      setCounts({
        totalUsers,
        scheduleOfManager,
        appointmentBooking,
        visitSchedule,
        prayerTracker,
      });
    };

    fetchCounts();
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
      toValue: -SCREEN_WIDTH * 0.7,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setMenuVisible(false);
    });
  };

  // Update stats to use dynamic counts from Firestore
  const stats = [
    { title: 'Total Users', count: counts.totalUsers, color: '#0056D2' },
    { title: 'Schedule of Manager', count: counts.scheduleOfManager, color: '#28a745' },
    { title: 'Appointment Booking', count: counts.appointmentBooking, color: '#ffc107' },
    { title: 'Visit Schedule', count: counts.visitSchedule, color: '#17a2b8' },
    { title: 'Prayer and Devotion Tracker', count: counts.prayerTracker, color: '#6f42c1' },
  ];

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={openMenu} style={styles.hamburger}>
          <Text style={{ fontSize: 28 }}>☰</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.header}>Pastor Dashboard</Text>
          <Text style={styles.userInfo}>
            {user.name} ({user.role})
          </Text>
        </View>
      </View>

      {/* Stats Cards */}
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.cardsContainer}>
          {stats.map((item, index) => (
            <View key={index} style={[styles.card, { backgroundColor: item.color }]}>
              <Text style={styles.cardCount}>{item.count}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Sidebar */}
      <Modal transparent={true} visible={menuVisible} animationType="none" onRequestClose={closeMenu}>
        <Pressable style={styles.modalOverlay} onPress={closeMenu}>
          <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
            {/* Profile Section */}
            <View style={styles.profileSection}>
              <View style={styles.profileRow}>
                <Text style={styles.profileName}>{user.name}</Text>
                <View style={styles.onlineBullet} />
              </View>
              <Text style={styles.profileStatus}>{user.role}</Text>
            </View>

            {/* Sidebar Navigation */}
            {user.role === 'admin' && (
              <TouchableOpacity
                style={styles.sidebarButton}
                onPress={() => {
                  closeMenu();
                  navigation.navigate('ManagerUser');
                }}
              >
                <Ionicons name="person-outline" size={20} color="#555" style={styles.icon} />
                <Text style={styles.sidebarItemText}>Manager User</Text>
              </TouchableOpacity>
            )}

            {(user.role === 'admin' || user.role === 'Pastor') && (
  <TouchableOpacity
    style={styles.sidebarButton}
    onPress={() => {
      closeMenu();
      navigation.navigate('schedule');
    }}
  >
    <MaterialIcons name="schedule" size={20} color="#555" style={styles.icon} />
    <Text style={styles.sidebarItemText}>Schedule of Manager</Text>
  </TouchableOpacity>
)}


  {(user.role === 'admin' || user.role === 'Pastor') && (
  <TouchableOpacity
              style={styles.sidebarButton}
              onPress={() => {
                closeMenu();
                navigation.navigate('list');
              }}
            >
              <MaterialIcons name="event-available" size={20} color="#555" style={styles.icon} />
              <Text style={styles.sidebarItemText}>Appointment Booking</Text>
            </TouchableOpacity>
)}
  {(user.role === 'admin' || user.role === 'Pastor') && (
 <TouchableOpacity
              style={styles.sidebarButton}
              onPress={() => {
                closeMenu();
                navigation.navigate('add_visit');
              }}
            >
              <FontAwesome5 name="calendar-check" size={18} color="#555" style={styles.icon} />
              <Text style={styles.sidebarItemText}> Add Visit Schedule</Text>
            </TouchableOpacity>
)}         


 {(user.role === 'admin' || user.role === 'Pastor'|| user.role==='member') && (
 <TouchableOpacity
              style={styles.sidebarButton}
              onPress={() => {
                closeMenu();
                navigation.navigate('visit');
              }}
            >
              <FontAwesome5 name="calendar-check" size={18} color="#555" style={styles.icon} />
              <Text style={styles.sidebarItemText}>Visit Schedule</Text>
            </TouchableOpacity>
)}         

     {user?.role === 'Pastor' && (
  <TouchableOpacity
    style={styles.sidebarButton}
    onPress={() => {
      closeMenu();
      navigation.navigate('tracker', { user });

    }}
  >
    <Ionicons name="book-outline" size={20} color="#555" style={styles.icon} />
    <Text style={styles.sidebarItemText}>Prayer & Devotion Tracker</Text>
  </TouchableOpacity>
)}

 
 {( user.role === 'member') && (
 <TouchableOpacity
              style={styles.sidebarButton}
              onPress={() => {
                closeMenu();
                navigation.navigate('booking');
              }}
            >
<Ionicons name="calendar-outline" size={20} color="#555" style={styles.icon} />
              <Text style={styles.sidebarItemText}>Request appointment</Text>
            </TouchableOpacity>
)}         
           
{( user.role === 'member') && (
 <TouchableOpacity
              style={styles.sidebarButton}
              onPress={() => {
                closeMenu();
                navigation.navigate('tracker');
              }}
            >
<Ionicons name="eye-outline" size={20} color="#555" style={styles.icon} />
              <Text style={styles.sidebarItemText}>View Visit Schedule</Text>
            </TouchableOpacity>
)}     


{( user.role === 'member') && (
 <TouchableOpacity
              style={styles.sidebarButton}
              onPress={() => {
                closeMenu();
                navigation.navigate('logs');
              }}
            >
<Ionicons name="journal-outline" size={20} color="#555" style={styles.icon} />
              <Text style={styles.sidebarItemText}>Log Prayers and Devotions</Text>
            </TouchableOpacity>
)}  

{( user.role === 'member') && (
 <TouchableOpacity
              style={styles.sidebarButton}
              onPress={() => {
                closeMenu();
                navigation.navigate('notify');
              }}
            >
<Ionicons name="notifications-outline" size={20} color="#555" style={styles.icon} />
              <Text style={styles.sidebarItemText}>Receive Notifications</Text>
            </TouchableOpacity>
)}  



            {/* Logout */}
            <TouchableOpacity
              style={[styles.sidebarButton, { marginTop: 20 }]}
              onPress={() => {
                closeMenu();
                navigation.navigate('Login');
              }}
            >
              <MaterialIcons name="logout" size={20} color="#D9534F" style={styles.icon} />
              <Text style={[styles.sidebarItemText, { color: '#D9534F' }]}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default DashboardScreen;

// ... your styles here (unchanged)


const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  hamburger: {
    marginRight: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  userInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f6fa',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  card: {
    width: '48%',
    paddingVertical: 30,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardCount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'row',
  },
  sidebar: {
    width: '70%',
    height: '100%',
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  profileSection: {
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 20,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  onlineBullet: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'green',
  },
  profileStatus: {
    marginTop: 4,
    fontSize: 14,
    color: '#666',
  },
  sidebarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  icon: {
    marginRight: 10,
  },
  sidebarItemText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
  },
});
