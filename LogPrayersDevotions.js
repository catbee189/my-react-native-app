import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from "react-native";

import { collection, getDocs, query, orderBy, where, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase"; // Your Firebase config file
import SidebarModal from './SidebarModal';
import SidebarToggle from './SidebarToggle';

export default function PrayerDevotionLogs({ route }) {
  // Get logged in user info from route params, fallback to guest
  const user = route?.params?.user || { id: null, name: "Guest", role: "N/A" };

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sidebar states
  const slideAnim = useRef(new Animated.Value(-250)).current;
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);

      try {
        const logsCol = collection(db, "prayer_devotion_tracker");

        let logsQuery;

        if (user.role === "member") {
          // Admin sees all logs
          logsQuery = query(logsCol, orderBy("created_at", "desc"));
        } else if (user.id) {
          // Non-admin sees only their logs
          logsQuery = query(logsCol, where("user_id", "==", user.id), orderBy("created_at", "desc"));
        } else {
          // Guest or no ID — no logs to show
          setLogs([]);
          setLoading(false);
          return;
        }

        const snapshot = await getDocs(logsQuery);

        // Map logs to array
        const logsArray = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch user names for logs (to show in UI), 
        // but for non-admins who only see their own logs, we can skip this.
        // Let's do it anyway, showing "Unknown" if missing.

        const logsWithUserNames = await Promise.all(
          logsArray.map(async (log) => {
            if (!log.user_id) return { ...log, userName: "Unknown" };

            // Optimization: If the log user_id === current user.id, use current user's name
            if (log.user_id === user.id) {
              return { ...log, userName: user.name || "You" };
            }

            // Otherwise fetch user doc by ID
            try {
              const userRef = doc(db, "users", log.user_id);
              const userSnap = await getDoc(userRef);

              if (userSnap.exists()) {
                return { ...log, userName: userSnap.data().name || "No Name" };
              } else {
                return { ...log, userName: "Unknown User" };
              }
            } catch {
              return { ...log, userName: "Unknown User" };
            }
          })
        );

        setLogs(logsWithUserNames);
      } catch (error) {
        console.error("Error fetching prayer logs:", error);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.center}>
        <SidebarToggle onOpen={() => setSidebarVisible(true)} />
        <SidebarModal visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        <ActivityIndicator size="large" color="#007aff" />
      </View>
    );
  }

  if (logs.length === 0) {
    return (
      <View style={styles.center}>
        <SidebarToggle onOpen={() => setSidebarVisible(true)} />
        <SidebarModal visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        <Text>No prayer & devotion logs found.</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    return (
      <View style={styles.logItem}>
        <Text style={styles.logUserName}>{item.userName}</Text>
        <Text style={styles.logDate}>
          Date: {item.created_at ? new Date(item.created_at.seconds * 1000).toLocaleString() : "N/A"}
        </Text>
        <Text style={styles.logLabel}>Devotion:</Text>
        <Text style={styles.logText}>{item.devotion_text || "No devotion text"}</Text>
        <Text style={styles.logLabel}>Prayer:</Text>
        <Text style={styles.logText}>{item.prayer_text || "No prayer text"}</Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SidebarToggle onOpen={() => setSidebarVisible(true)} />
      <SidebarModal visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 20,
    backgroundColor: "#f9f9f9",
    paddingBottom: 30,
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
