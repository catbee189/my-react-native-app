// DrawerNavigator.js
import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Sidebar from "./Sidebar";

import LoginForm from "./LoginForm";
import ForgetPasswordScreen from "./ForgetPasswordScreen";
import VerificationScreen from "./VerificationScreen";
import ResetPasswordScreen from "./ResetPasswordScreen";
import DashboardScreen from "./DashboardScreen";
import ManagerUserScreen from "./ManagerUserScreen";
import AddUser from "./AddUser";
import ManagerSchedule from "./ManagerSchedule";
import BookingScreen from "./BookingScreen";
import VisitSchedule from "./VisitSchedule";
import DevotionTracker from "./DevotionTracker";
import EditUser from "./EditUser";
import adddSchedule from "./adddSchedule";
import ScheduleUpdate from "./ScheduleUpdate";
import listt_booking from "./listt_booking";
import AddPrayerTracker from "./AddPrayerTracker";
import Add_visit from "./Add_visit";
import LogPrayersDevotions from "./LogPrayersDevotions";

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" component={DashboardScreen} />
      <Stack.Screen name="ManagerUser" component={ManagerUserScreen} />
      <Stack.Screen name="add" component={AddUser} />
      <Stack.Screen name="schedule" component={ManagerSchedule} />
      <Stack.Screen name="booking" component={BookingScreen} />
      <Stack.Screen name="visit" component={VisitSchedule} />
      <Stack.Screen name="divition" component={DevotionTracker} />
      <Stack.Screen name="EditUser" component={EditUser} />
      <Stack.Screen name="editschedule" component={ScheduleUpdate} />
      <Stack.Screen name="adddSchedule" component={adddSchedule} />
      <Stack.Screen name="list" component={listt_booking} />
      <Stack.Screen name="tracker" component={AddPrayerTracker} />
      <Stack.Screen name="add_visit" component={Add_visit} />
      <Stack.Screen name="logs" component={LogPrayersDevotions} />
    </Stack.Navigator>
  );
}

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <Sidebar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {/* Main app stack inside drawer */}
      <Drawer.Screen name="MainStack" component={MainStack} />

      {/* Authentication screens outside main stack */}
      <Drawer.Screen name="Login" component={LoginForm} />
      <Drawer.Screen name="ForgotPassword" component={ForgetPasswordScreen} />
      <Drawer.Screen name="Verification" component={VerificationScreen} />
      <Drawer.Screen name="resetpassword" component={ResetPasswordScreen} />
    </Drawer.Navigator>
  );
}
