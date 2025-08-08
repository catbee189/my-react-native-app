import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Screens
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import webpage from "./webpage";

import DashboardScreen  from './DashboardScreen';
import ManagerUserScreen from './ManagerUserScreen'; // Adjust path

import AddUser from './AddUser';
import ManagerSchedule from './ManagerSchedule';
import BookingScreen from './BookingScreen';
import VisitSchedule from './VisitSchedule';
import DevotionTracker from './DevotionTracker';
import EditUser from './EditUser';
import adddSchedule from './adddSchedule';
import ScheduleUpdate from './ScheduleUpdate';
import listt_booking from './listt_booking';
import AddPrayerTracker from './AddPrayerTracker';
import Add_visit from './Add_visit';
import LogPrayersDevotions from './LogPrayersDevotions';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer.Navigator screenOptions={{ headerShown: true }}>
        <Drawer.Screen name="LoginForm " component={LoginForm } />
                <Drawer.Screen name="Dashboard" component={DashboardScreen} />

        <Drawer.Screen name="Users" component={ManagerUserScreen} />
        <Drawer.Screen name="Add User" component={AddUser} />
        <Drawer.Screen name="Edit User" component={EditUser} />
        <Drawer.Screen name="Schedule Manager" component={ManagerSchedule} />
        <Drawer.Screen name="Edit Schedule" component={ScheduleUpdate} />
        <Drawer.Screen name="Add Schedule" component={adddSchedule} />
        <Drawer.Screen name="Bookings" component={BookingScreen} />
        <Drawer.Screen name="Booking List" component={listt_booking} />
        <Drawer.Screen name="Visit Schedule" component={VisitSchedule} />
        <Drawer.Screen name="Add Visit" component={Add_visit} />
        <Drawer.Screen name="Devotion Tracker" component={DevotionTracker} />
        <Drawer.Screen name="Add Tracker" component={AddPrayerTracker} />
        <Drawer.Screen name="Logs" component={LogPrayersDevotions} />
        <Drawer.Screen name="webpage" component={webpage} />


      </Drawer.Navigator>
    </GestureHandlerRootView>
  );
};

export default DrawerNavigator;
