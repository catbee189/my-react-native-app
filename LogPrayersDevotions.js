import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./firebase"; // Your Firebase config file

export default function PrayerDevotionLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch prayer devotion logs
  useEffect(() => {
    async function fetchLogs() {
      try {
        const logsCol = collection(db, "prayer_devotion_tracker");
        // Fetch logs ordered by created_at desc (latest first)
        const q = query(logsCol, orderBy("created_at", "desc"));
        const snapshot = await getDocs(q);

        // Map logs to array
        const logsArray = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Now fetch user names for each log by user_id
        // To optimize, you could batch fetch all users involved, but here we'll fetch individually for clarity
        const usersCol = collection(db, "users");

        const logsWithUserNames = await Promise.all(
          logsArray.map(async (log) => {
            if (!log.user_id) return { ...log, userName: "Unknown" };
            // Fetch user doc for this user_id
            const userDoc = await getDocs(
              query(usersCol, orderBy("__name__")) // Fallback in case you want order
            );

            // Alternatively, fetch single user doc by ID:
            // But Firestore JS SDK v9+ doesn't provide getDoc by string query easily here,
            // so simplest way is to fetch user doc by ID:
            const userRef = doc(db, "users", log.user_id);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              return { ...log, userName: userSnap.data().name || "No Name" };
            } else {
              return { ...log, userName: "Unknown User" };
            }
          })
        );

        setLogs(logsWithUserNames);
      } catch (error) {
        console.error("Error fetching prayer logs:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007aff" />
      </View>
    );
  }

  if (logs.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No prayer & devotion logs found.</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.logItem}>
      <Text style={styles.logUserName}>{item.userName}</Text>
      <Text style={styles.logDate}>
        Date: {item.date || "N/A"}
      </Text>
      <Text style={styles.logLabel}>Devotion:</Text>
      <Text style={styles.logText}>{item.devotion_text || "No devotion text"}</Text>
      <Text style={styles.logLabel}>Prayer:</Text>
      <Text style={styles.logText}>{item.prayer_text || "No prayer text"}</Text>
    </View>
  );

  return (
    <FlatList
      data={logs}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContainer}
    />
  );
}

import { doc, getDoc } from "firebase/firestore";

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  logItem: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  logUserName: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 4,
    color: "#222",
  },
  logDate: {
    fontSize: 14,
    marginBottom: 8,
    color: "#666",
  },
  logLabel: {
    fontWeight: "600",
    marginTop: 6,
    marginBottom: 2,
    color: "#555",
  },
  logText: {
    fontSize: 15,
    color: "#333",
  },
});
