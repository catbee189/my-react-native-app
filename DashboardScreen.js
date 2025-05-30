import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import SidebarModal from './SidebarModal';
import SidebarToggle from './SidebarToggle';

const SCREEN_WIDTH = Dimensions.get('window').width;

const DashboardScreen = ({ navigation, route }) => {
  const user = route.params?.user || { name: 'Guest', role: 'N/A' };
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [counts, setCounts] = useState({
    totalUsers: 0,
    scheduleOfManager: 0,
    appointmentBooking: 0,
    visitSchedule: 0,
    prayerTracker: 0,
  });

  const [scheduleData, setScheduleData] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);

  // Helper to get counts from Firestore
  const getCount = async (collectionName) => {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      return snapshot.size;
    } catch (error) {
      console.error(`Error getting ${collectionName}`, error);
      return 0;
    }
  };

  // Fetch counts on mount
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

  // Fetch schedule details for Bar Chart
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'schedules'));
        const schedules = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || 'No Title',
            start_date: data.start_date?.toDate ? data.start_date.toDate() : new Date(data.start_date),
            end_date: data.end_date?.toDate ? data.end_date.toDate() : new Date(data.end_date),
          };
        });
        setScheduleData(schedules);
      } catch (error) {
        console.error('Error fetching schedules', error);
      } finally {
        setLoadingSchedules(false);
      }
    };
    fetchSchedules();
  }, []);

  const stats = [
    {
      title: 'Users',
      count: counts.totalUsers,
      icon: <FontAwesome5 name="users" size={24} color="white" />,
      color: '#000000',
      onPress: () => Alert.alert('Users', 'Navigate to Users screen'),
    },
    {
      title: 'Schedules',
      count: counts.scheduleOfManager,
      icon: <MaterialIcons name="schedule" size={24} color="white" />,
      color: '#28a745',
      onPress: () => Alert.alert('Schedules', 'Navigate to Schedules screen'),
    },
    {
      title: 'Appointments',
      count: counts.appointmentBooking,
      icon: <Ionicons name="calendar" size={24} color="white" />,
      color: '#ffc107',
      onPress: () => Alert.alert('Appointments', 'Navigate to Appointments screen'),
    },
    {
      title: 'Visit Schedules',
      count: counts.visitSchedule,
      icon: <Ionicons name="walk" size={24} color="white" />,
      color: '#17a2b8',
      onPress: () => Alert.alert('Visit Schedules', 'Navigate to Visit Schedules screen'),
    },
    {
      title: 'Prayer Logs',
      count: counts.prayerTracker,
      icon: <FontAwesome5 name="pray" size={24} color="white" />,
      color: '#6f42c1',
      onPress: () => Alert.alert('Prayer Logs', 'Navigate to Prayer Logs screen'),
    },
  ];

  const pieData = [
    {
      name: 'Prayer',
      population: Math.round(counts.prayerTracker * 0.6),
      color: '#4e73df',
      legendFontColor: '#333',
      legendFontSize: 14,
    },
    {
      name: 'Devotion',
      population: Math.round(counts.prayerTracker * 0.4),
      color: '#1cc88a',
      legendFontColor: '#333',
      legendFontSize: 14,
    },
  ];

  // Prepare BarChart data from scheduleData
  const barChartData = {
    labels: scheduleData.map(sch =>
      sch.title.length > 10 ? sch.title.slice(0, 10) + '...' : sch.title
    ),
    datasets: [
      {
        data: scheduleData.map(sch => {
          const durationMs = sch.end_date - sch.start_date;
          const durationDays = Math.max(Math.round(durationMs / (1000 * 60 * 60 * 24)), 1);
          return durationDays;
        }),
      },
    ],
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <SidebarToggle onOpen={() => setSidebarVisible(true)} />
        <SidebarModal visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        <View>
          <Text style={styles.header}>Pastor Dashboard</Text>
          <Text style={styles.userInfo}>{user.name} ({user.role})</Text>
        </View>
      </View>

      {/* Body */}
      <ScrollView contentContainerStyle={styles.container}>
        {/* Stats Cards */}
        <View style={styles.cardsContainer}>
          {stats.map((item, index) => (
            <View key={index} style={[styles.card, { backgroundColor: item.color }]}>
              {item.icon}
              <Text style={styles.cardCount}>{item.count}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Pie Chart */}
        <Text style={styles.sectionTitle}>Prayer vs Devotion</Text>
        <PieChart
          data={pieData}
          width={SCREEN_WIDTH - 40}
          height={200}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />

        {/* Bar Chart for Schedules */}
        <Text style={styles.sectionTitle}>Schedule Durations (Days)</Text>
        {loadingSchedules ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : scheduleData.length === 0 ? (
          <Text style={styles.noDataText}>No schedules found.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
       <BarChart
  data={barChartData}
  width={Math.max(SCREEN_WIDTH, scheduleData.length * 60)}
  height={220}
  fromZero
  yAxisSuffix="d"
  chartConfig={{
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,  // 👈 blue bars
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // black labels
  }}
  verticalLabelRotation={45}
  showValuesOnTopOfBars
/>

          </ScrollView>
        )}
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff', // Changed background to white
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0056b3',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  container: {
    padding: 20,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    paddingVertical: 25,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  cardTitle: {
    fontSize: 18,
    color: '#fff',
    marginTop: 5,
  },
  button: {
    marginTop: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007bff',
    marginBottom: 10,
    marginTop: 15,
  },
  noDataText: {
    color: '#333',
    fontSize: 16,
  },
});
