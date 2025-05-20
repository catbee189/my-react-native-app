// Sidebar.js
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Sidebar({ navigation }) {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          console.log("No user data found");
        }
      }
    };

    fetchUserData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Menu</Text>

      {userData && (
        <View style={styles.userSection}>
          <Text style={styles.userName}>{userData.fullName}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>
          <Text style={styles.userRole}>Role: {userData.role}</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => {
          navigation.navigate("dashboard");
          navigation.closeDrawer();
        }}
      >
        <Text style={styles.menuText}>Dashboard</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => {
          navigation.navigate("ManagerUser");
          navigation.closeDrawer();
        }}
      >
        <Text style={styles.menuText}>Manage Users</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => {
          navigation.navigate("schedule");
          navigation.closeDrawer();
        }}
      >
        <Text style={styles.menuText}>Manage Schedule</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => {
          navigation.navigate("Login");
          navigation.closeDrawer();
        }}
      >
        <Text style={styles.menuText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 50 },
  header: { fontSize: 24, fontWeight: "bold", marginLeft: 20, marginBottom: 20 },
  userSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingBottom: 10,
  },
  userName: { fontSize: 20, fontWeight: "bold" },
  userEmail: { fontSize: 14, color: "gray" },
  userRole: { fontSize: 14, fontStyle: "italic", color: "#555" },
  menuItem: { paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderColor: "#ddd" },
  menuText: { fontSize: 18 },
});
