import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SidebarModal({ visible, onClose }) {
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const navigation = useNavigation();
  const route = useRoute();

  // Dummy fallback user data
  const user = route.params?.user || { name: 'Guest', role: 'N/A' };
  const role = user.role?.toLowerCase();

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [visible]);

  // Define all links with role access
  const allLinks = [
    { label: 'Dashboard', icon: 'chart-bar', screen: 'DashboardScreen', roles: ['admin', 'pastor', 'member'] },
        { label: 'Add Users', icon: 'users', screen: 'add', roles: ['admin'] },

    { label: 'Manage Users', icon: 'users', screen: 'ManagerUserScreen', roles: ['admin'] },
           { label: 'Add Schedule', icon: 'calendar-alt', screen: 'adddSchedule', roles: ['admin', 'pastor','member'] },

    { label: 'Schedule', icon: 'calendar-alt', screen: 'ManagerSchedule', roles: ['admin', 'pastor','member'] },

    
    
    { label: 'Request Appointment', icon: 'calendar-alt', screen: 'BookingScreen', roles: ['member'] },

    { label: 'Appointments', icon: 'handshake', screen: 'listt_booking', roles: ['admin', 'pastor'] },

    { label: 'Visit Schedules', icon: 'route', screen: 'VisitSchedule', roles: ['admin', 'pastor','member'] },
    { label: 'Prayer & Devotion', icon: 'praying-hands', screen: 'AddPrayerTracker', roles: [ 'pastor'] },
      { label: 'Log Prayers and Devotions', icon: 'praying-hands', screen: 'logs', roles: ['member'] },

      { label: 'Logout', icon: 'sign-out-alt', screen: 'Login', roles: ['pastor','member','admin'] },

  ];

  // Filter links by user role
  const filteredLinks = allLinks.filter(link => link.roles.includes(role));

  return (
    <Modal visible={visible} animationType="none" transparent>
      <TouchableOpacity
        style={styles.overlay}
        onPress={onClose}
        activeOpacity={1}
      >
        <Animated.View style={[styles.sidebar, { left: slideAnim }]}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              <Text style={styles.bullet}>• </Text>
              {user.role === 'admin' ? 'Admin Menu' : user.role === 'pastor' ? 'Pastor Menu' : 'Member Menu'}
            </Text>
            <View style={styles.userInfo}>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.role}>{user.role}</Text>
            </View>
          </View>

          {filteredLinks.map((item, index) => {
            const isActive = route.name === item.screen;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.link, isActive && styles.activeLink]}
                onPress={() => {
                  if (!isActive) navigation.navigate(item.screen, { user });
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <FontAwesome5
                  name={item.icon}
                  size={18}
                  color={isActive ? '#1abc9c' : '#2c3e50'}
                  style={styles.icon}
                />
                <Text style={[styles.linkText, isActive && styles.activeText]}>
                  {isActive ? '• ' : ''}
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  bullet: {
    color: '#1abc9c',
    fontWeight: 'bold',
    fontSize: 22,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 260,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 2, height: 0 },
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  titleContainer: {
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  userInfo: {
    marginTop: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  role: {
    fontSize: 14,
    color: '#1abc9c',
    fontStyle: 'italic',
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderRadius: 8,
  },
  activeLink: {
    backgroundColor: '#ecf9f7',
    borderRadius: 8,
  },
  icon: {
    marginRight: 14,
    width: 24,
    textAlign: 'center',
  },
  linkText: {
    fontSize: 16,
    color: '#34495e',
  },
  activeText: {
    fontWeight: 'bold',
    color: '#1abc9c',
  },
});
