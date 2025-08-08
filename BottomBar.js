// components/BottomBar.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function BottomBar({ user }) {
  const navigation = useNavigation();

  return (
    <View style={styles.bottomBar}>
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('landings_page', { user })}>
        <Ionicons name="home" size={24} color="#fff" />
        <Text style={styles.bottomText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Booking', { user })}>
        <Ionicons name="calendar" size={24} color="#fff" />
        <Text style={styles.bottomText}>Booking</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('approvebook', { user })}>
        <Ionicons name="time" size={24} color="#fff" />
        <Text style={styles.bottomText}>Schedule</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('logss', { user })}>
        <MaterialCommunityIcons name=" praying-hands" size={24} color="#fff" />
        <Text style={styles.bottomText}>Praying</Text>
      </TouchableOpacity>

      
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#2b6cb0',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  item: {
    alignItems: 'center',
  },
  bottomText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  userInfo: {
    position: 'absolute',
    right: 10,
    bottom: 10,
  },
  userText: {
    color: '#fff',
    fontStyle: 'italic',
    fontSize: 13,
  },
});
