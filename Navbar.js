// components/Navbar.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function Navbar({ user }) {
  const navigation = useNavigation();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const q = query(
          collection(db, 'schedules'),
          where('status', 'in', ['approved', 'rejected'])
        );
        const querySnapshot = await getDocs(q);
        setNotificationCount(querySnapshot.size);
      } catch (error) {
        console.error('Error fetching schedules:', error);
      }
    };

    fetchNotificationCount();
  }, []);

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        Alert.alert('Logout', 'Logout Successfully ✅');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Loginmem' }],
        });
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
      });
  };

  const handleNotificationPress = () => {
    navigation.navigate('approvebook' ,{ user });
  };

  return (
    <View style={styles.navbar}>
      <View style={styles.leftNav}>
        <Ionicons name="person-circle-outline" size={28} color="#fff" />
        <Text style={styles.navTitle}>
          {user?.firstName
            ? `${user.firstName} ${user.lastName || ''}`
            : 'Welcome'}
        </Text>
      </View>

      <View style={styles.rightNav}>
        <TouchableOpacity onPress={handleNotificationPress}>
          <View style={{ position: 'relative' }}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color="#fff"
              style={styles.icon}
            />
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notificationCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout}>
          <FontAwesome name="sign-out" size={24} color="#fff" style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(43, 108, 176, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  leftNav: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  rightNav: {
    flexDirection: 'row',
  },
  icon: {
    marginLeft: 15,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
