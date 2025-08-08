import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginForm from './LoginForm';
import ForgetPasswordScreen from './ForgetPasswordScreen';
import linking from './LinkingConfiguration';
import ApprovedBookingsScreen from './ApprovedBookingsScreen';
import landing_page from './landing_page';
import { UserProvider } from './UserContext';
import VerificationScreen from './VerificationScreen';
import ResetPasswordScreen from './ResetPasswordScreen';
import DashboardScreen from './DashboardScreen';
import ManagerUserScreen from './ManagerUserScreen';
import AddUser from './AddUser';
import ManagerSchedule from './ManagerSchedule';
import BookingScreen from './BookingScreen';
import VisitSchedule from './VisitSchedule';
import DevotionTracker from './DevotionTracker';
import EditUser from './EditUser';
import AddSchedule from './adddSchedule';
import ScheduleUpdate from './ScheduleUpdate';
import listt_booking  from './listt_booking';
import AddPrayerTracker from './AddPrayerTracker';
import AddVisit from './Add_visit';
import LogPrayersDevotions from './LogPrayersDevotions';
import LoginMember from './LoginMember';
import SignUp from './SignUp';
import ForgetPasswordMember from './ForgetPasswordmem';
import ManageMembersScreen from './ManageMembersScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <UserProvider>
      <NavigationContainer linking={linking}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* Authentication */}
          <Stack.Screen name="Login" component={LoginForm} />
          <Stack.Screen name="signup" component={SignUp} />
          <Stack.Screen name="Forgot" component={ForgetPasswordScreen} />
          <Stack.Screen name="forgetmem" component={ForgetPasswordMember} />
          <Stack.Screen name="resetpassword" component={ResetPasswordScreen} />
          <Stack.Screen name="Loginmem" component={LoginMember} />
          <Stack.Screen name="Verification" component={VerificationScreen} />

          {/* Main Screens */}
          <Stack.Screen name="DashboardScreen" component={DashboardScreen} />
          <Stack.Screen name="ManagerUserScreen" component={ManagerUserScreen} />
          <Stack.Screen name="ManagerSchedule" component={ManagerSchedule} />
          <Stack.Screen name="Booking" component={BookingScreen} />
          <Stack.Screen name="VisitSchedule" component={VisitSchedule} />
          <Stack.Screen name="divotion" component={DevotionTracker} />

          {/* User Management */}
          <Stack.Screen name="add" component={AddUser} />
          <Stack.Screen name="EditUser" component={EditUser} />

          {/* Schedule */}
          <Stack.Screen name="adddSchedule" component={AddSchedule} />
          <Stack.Screen name="ScheduleUpdate" component={ScheduleUpdate} />
          <Stack.Screen name="listt" component={listt_booking} />

          {/* Trackers */}
          <Stack.Screen name="AddPrayerTracker" component={AddPrayerTracker} />
          <Stack.Screen name="add_visit" component={AddVisit} />
          <Stack.Screen name="logss" component={LogPrayersDevotions} />
          <Stack.Screen name="manageuser" component={ManageMembersScreen} />

          {/* Pages */}
          <Stack.Screen name="landings_page" component={landing_page} />
          <Stack.Screen name="approvebook" component={ApprovedBookingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
};

export default App;
