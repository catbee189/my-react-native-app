import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase'; // Make sure these are correctly exported from your firebase.js

const UserProfileScreen = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is logged in, fetch their Firestore user document by UID
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data());
          } else {
            console.log('No user document found!');
            setUserData(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserData(null);
        }
      } else {
        // User not logged in
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loading} />;
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No user data found. Please log in.</Text>
      </View>
    );
  }

  // Display user info here
  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Profile</Text>
      <Text style={styles.label}>Full Name:</Text>
      <Text style={styles.value}>{userData.name || 'No name provided'}</Text>

      <Text style={styles.label}>Email:</Text>
      <Text style={styles.value}>{userData.email || 'No email provided'}</Text>

      <Text style={styles.label}>Role:</Text>
      <Text style={styles.value}>{userData.role || 'No role assigned'}</Text>

      {/* Add more user fields as needed */}
    </View>
  );
};

const styles = StyleSheet.create({
  loading: { marginTop: 50 },
  container: {
    padding: 20,
    marginTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    marginTop: 4,
  },
  message: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
});

export default UserProfileScreen;
