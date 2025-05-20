import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "./firebase"; // Your Firebase config and exports
import * as Notifications from "expo-notifications";

// Configure notification handler for Expo (required for alerts)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("user_id", "==", user.uid),
      orderBy("created_at", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const notification = { id: change.doc.id, ...change.doc.data() };
          Alert.alert("New Notification", notification.message);
          if (Platform.OS !== "web") {
            Notifications.scheduleNotificationAsync({
              content: {
                title: "New Notification",
                body: notification.message,
              },
              trigger: null,
            });
          }
        }
      });

      const allNotifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNotifications(allNotifications);
    });

    return () => unsubscribe();
  }, [user]);

  async function markAsRead(id) {
    const notifRef = doc(db, "notifications", id);
    await updateDoc(notifRef, { is_read: true });
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        item.is_read ? styles.read : styles.unread,
      ]}
      onPress={() => {
        if (!item.is_read) markAsRead(item.id);
        Alert.alert("Notification", item.message);
      }}
    >
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.date}>
        {item.created_at?.toDate().toLocaleString() || ""}
      </Text>
      <Text style={styles.status}>{item.is_read ? "Read" : "Unread"}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>No notifications found.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  notificationItem: {
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  unread: {
    backgroundColor: "#e0f7fa",
    borderColor: "#00acc1",
  },
  read: {
    backgroundColor: "#fafafa",
    borderColor: "#ccc",
  },
  message: {
    fontSize: 16,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: "#666",
  },
  status: {
    fontWeight: "bold",
    color: "#007aff",
    marginTop: 6,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: 50,
  },
});
