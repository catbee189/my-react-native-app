import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const NavbarDashboard = ({ user, pendingCount }) => {
  const navigation = useNavigation();

  const goToPendingBookings = () => {
    navigation.navigate('listt', { user });
  };

  return (
    <View>
      <Text style={styles.header}>Pastor Dashboard</Text>
      <View style={styles.flex}>
        <Text style={styles.userInfo}>
          {user.name} ({user.role})
        </Text>

        <View style={{ position: 'relative' }}>
          <TouchableOpacity onPress={goToPendingBookings}>
            <MaterialIcons
              name="notifications"
              size={28}
              color={pendingCount > 0 ? 'red' : 'white'}
            />
            {pendingCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default NavbarDashboard;

const styles = StyleSheet.create({
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  flex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    fontSize: 16,
    color: '#fff',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
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
