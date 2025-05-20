import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginForm from './LoginForm';
import ForgetPasswordScreen from './ForgetPasswordScreen';
import VerificationScreen from './VerificationScreen';
import ResetPasswordScreen from './ResetPasswordScreen';
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

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginForm} />
        <Stack.Screen name="ForgotPassword" component={ForgetPasswordScreen} />
        <Stack.Screen name="Verification" component={VerificationScreen} />
       <Stack.Screen name="resetpassword" component={ResetPasswordScreen}/>
       <Stack.Screen name="dashboard" component={DashboardScreen}/>
      <Stack.Screen name="ManagerUser" component={ManagerUserScreen}/>
      <Stack.Screen name="schedule" component={ManagerSchedule}/>
      <Stack.Screen name="booking" component={BookingScreen}/>
      <Stack.Screen name="visit" component={VisitSchedule }/>
      <Stack.Screen name="divotion" component={DevotionTracker}/>
      <Stack.Screen name="add" component={AddUser}/>
      <Stack.Screen name="EditUser" component={EditUser} />
      <Stack.Screen name="editschedule" component={ScheduleUpdate}/>
      <Stack.Screen name="adddSchedule" component={adddSchedule}/>
      <Stack.Screen name="list" component={listt_booking}/>
      <Stack.Screen name="tracker" component={AddPrayerTracker}/>
      <Stack.Screen name="add_visit" component={Add_visit}/>
      <Stack.Screen name="logs" component={LogPrayersDevotions}/>

      </Stack.Navigator>
    </NavigationContainer>  
  );
};

export default App;
