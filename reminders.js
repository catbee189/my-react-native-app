import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Alert, FlatList, StyleSheet } from "react-native";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  Timestamp 
} from "firebase/firestore";
import { db } from "./firebase";

export default function NotificationReminder({ user }) {
  // user is { id: "userId123", name: "John" } or similar
  const [reminderText, setReminderText] = useState("");
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Insert a reminder into Firestore
  async function addReminder() {
    if (!reminderText.trim()) {
      Alert.alert("Error", "Please enter a reminder text");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "reminders"), {
        user_id: user.id,
        text: reminderText.trim(),
        created_at: Timestamp.now(),   // <-- Use Firestore Timestamp here
        reminded: false,
      });
      setReminderText("");
      Alert.alert("Success", "Reminder added!");
      fetchReminders();
    } catch (error) {
      Alert.alert("Error", "Failed to add reminder: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  // Fetch reminders from Firestore for this user
  async function fetchReminders() {
    setLoading(true);
    try {
      const remindersCol = collection(db, "reminders");
      const q = query(
        remindersCol,
        where("user_id", "==", user.id),
        orderBy("created_at", "desc")
      );
      const snapshot = await getDocs(q);
      const reminderList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReminders(reminderList);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch reminders: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  // Load reminders on mount
  useEffect(() => {
    fetchReminders();
  }, []);

  // Show alerts for new reminders (optional)
  useEffect(() => {
    reminders.forEach((reminder) => {
      if (!reminder.reminded) {
        Alert.alert("Reminder", reminder.text);
        // You can optionally update 'reminded' field here to true, if you want
      }
    });
  }, [reminders]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a Reminder</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter reminder text"
        value={reminderText}
        onChangeText={setReminderText}
      />
      <Button 
        title={loading ? "Please wait..." : "Add Reminder"} 
        onPress={addReminder} 
        disabled={loading} 
      />

      <Text style={styles.subtitle}>Your Reminders:</Text>
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.reminderItem}>
            <Text>{item.text}</Text>
            <Text style={styles.dateText}>
              {item.created_at?.seconds
                ? new Date(item.created_at.seconds * 1000).toLocaleString()
                : new Date(item.created_at).toLocaleString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text>No reminders yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, maxWidth: 600, margin: "auto" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  subtitle: { marginTop: 20, fontSize: 18, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  reminderItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  dateText: {
    color: "#666",
    fontSize: 12,
  },
});

  // Fetch reminders from Firestore for this user
  async function fetchReminders() {
    setLoading(true);
    try {
      const remindersCol = collection(db, "reminders");
      const q = query(
        remindersCol,
        where("user_id", "==", user.id),
        orderBy("created_at", "desc")
      );
      const snapshot = await getDocs(q);
      const reminderList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReminders(reminderList);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch reminders: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  // Check reminders and show alert if any new reminders are found (simple simulation)
  useEffect(() => {
    fetchReminders();
  }, []);

  useEffect(() => {
    // Check if there's any reminder text we want to alert about
    reminders.forEach((reminder) => {
      if (!reminder.reminded) {
        Alert.alert("Reminder", reminder.text);
        // Here you can update the reminder doc to set reminded: true, so it won't alert again
        // But Firestore update code omitted here for simplicity
      }
    });
  }, [reminders]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a Reminder</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter reminder text"
        value={reminderText}
        onChangeText={setReminderText}
      />
      <Button title={loading ? "Please wait..." : "Add Reminder"} onPress={addReminder} disabled={loading} />

      <Text style={styles.subtitle}>Your Reminders:</Text>
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.reminderItem}>
            <Text>{item.text}</Text>
            <Text style={styles.dateText}>{new Date(item.created_at.seconds ? item.created_at.seconds * 1000 : item.created_at).toLocaleString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No reminders yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, maxWidth: 600, margin: "auto" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  subtitle: { marginTop: 20, fontSize: 18, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  reminderItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  dateText: {
    color: "#666",
    fontSize: 12,
  },
});
