import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  Platform,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
  Animated,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

const SCREEN_WIDTH = 360;

function showAlert(title, message) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export default function AddPrayerTracker({ navigation }) {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [pastors, setPastors] = useState([]);
  const [selectedPastor, setSelectedPastor] = useState(null);

  const [devotionText, setDevotionText] = useState("");
  const [prayerText, setPrayerText] = useState("");

  // Sidebar modal state & animation
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;

  useEffect(() => {
    async function fetchPastors() {
      try {
        const q = query(collection(db, "users"), where("role", "==", "member"));
        const querySnapshot = await getDocs(q);
        const pastorsList = [];
        querySnapshot.forEach((doc) => {
          pastorsList.push({ id: doc.id, ...doc.data() });
        });
        setPastors(pastorsList);
      } catch (error) {
        console.error("Error fetching pastors:", error);
      }
    }
    fetchPastors();
  }, []);

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) setDate(selectedDate);
  };

  const handleSubmit = async () => {
    if (!selectedPastor) {
      showAlert("Validation Error", "Please select a pastor.");
      return;
    }
    if (!devotionText.trim() || !prayerText.trim()) {
      showAlert("Validation Error", "Please fill devotion and prayer texts.");
      return;
    }

    try {
      await addDoc(collection(db, "prayer_devotion_tracker"), {
        user_id: selectedPastor,
        date: date.toISOString().split("T")[0],
        devotion_text: devotionText.trim(),
        prayer_text: prayerText.trim(),
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      showAlert("Success", "Prayer & Devotion saved successfully.");

      setSelectedPastor(null);
      setDevotionText("");
      setPrayerText("");
      setDate(new Date());
    } catch (error) {
      console.error("Error saving prayer devotion:", error);
      showAlert("Error", "Failed to save data.");
    }
  };

  // Sidebar open animation
  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Sidebar close animation
  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -SCREEN_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setMenuVisible(false));
  };

  return (
    <>
      {/* Menu button */}
      <TouchableOpacity onPress={openMenu} style={styles.menuButton}>
        <Ionicons name="menu" size={32} color="#444" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Add Prayer & Devotion</Text>

        <Text style={styles.label}>Select Date</Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.input}
          activeOpacity={0.7}
        >
          <Text style={styles.dateText}>{date.toDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onChangeDate}
            maximumDate={new Date()}
          />
        )}

        <Text style={styles.label}>Select Pastor</Text>
        <View style={styles.pickerContainer}>
          {pastors.length === 0 ? (
            <Text style={styles.loadingText}>Loading pastors...</Text>
          ) : (
            pastors.map((pastor) => (
              <TouchableOpacity
                key={pastor.id}
                onPress={() => setSelectedPastor(pastor.id)}
                style={[
                  styles.pastorOption,
                  selectedPastor === pastor.id && styles.pastorOptionSelected,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.pastorName,
                    selectedPastor === pastor.id && styles.pastorNameSelected,
                  ]}
                >
                  {pastor.name}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <Text style={styles.label}>Devotion Text</Text>
        <TextInput
          multiline
          style={[styles.input, styles.textArea]}
          value={devotionText}
          onChangeText={setDevotionText}
          placeholder="Enter devotion text"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Prayer Text</Text>
        <TextInput
          multiline
          style={[styles.input, styles.textArea]}
          value={prayerText}
          onChangeText={setPrayerText}
          placeholder="Enter prayer text"
          placeholderTextColor="#999"
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Sidebar Modal */}
      <Modal
        transparent
        visible={menuVisible}
        animationType="none"
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.modalOverlay} onPress={closeMenu}>
          <Animated.View
            style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
          >
            <View style={styles.profileSection}>
              <View style={styles.profileRow}>
                <Text style={styles.profileName}>Pastor John</Text>
                <View style={styles.onlineBullet} />
              </View>
              <Text style={styles.profileStatus}>Online</Text>
            </View>

            <TouchableOpacity
              style={styles.sidebarButton}
              onPress={() => {
                closeMenu();
                navigation.navigate("ManagerUser");
              }}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color="#555"
                style={styles.icon}
              />
              <Text style={styles.sidebarItemText}>Manager User</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sidebarButton}
              onPress={() => {
                closeMenu();
                navigation.navigate("schedule");
              }}
            >
              <MaterialIcons
                name="schedule"
                size={20}
                color="#555"
                style={styles.icon}
              />
              <Text style={styles.sidebarItemText}>Schedule of Manager</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sidebarButton}
              onPress={() => {
                closeMenu();
                navigation.navigate("booking");
              }}
            >
              <MaterialIcons
                name="event-available"
                size={20}
                color="#555"
                style={styles.icon}
              />
              <Text style={styles.sidebarItemText}>Appointment Booking</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sidebarButton}
              onPress={() => {
                closeMenu();
                navigation.navigate("visit");
              }}
            >
              <FontAwesome5
                name="calendar-check"
                size={18}
                color="#555"
                style={styles.icon}
              />
              <Text style={styles.sidebarItemText}>Visit Schedule</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sidebarButton}
              onPress={() => {
                closeMenu();
                navigation.navigate("divition");
              }}
            >
              <Ionicons
                name="book-outline"
                size={20}
                color="#555"
                style={styles.icon}
              />
              <Text style={styles.sidebarItemText}>Prayer & Devotion Tracker</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sidebarButton, { marginTop: 20 }]}
              onPress={() => {
                closeMenu();
                navigation.navigate("Login");
              }}
            >
              <MaterialIcons
                name="logout"
                size={20}
                color="#D9534F"
                style={styles.icon}
              />
              <Text style={[styles.sidebarItemText, { color: "#D9534F" }]}>
                Logout
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: "#f7f9fc",
    minHeight: "100%",
    alignItems: "center",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  label: {
    width: "100%",
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 8,
    color: "#555",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  pickerContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 20,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pastorOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  pastorOptionSelected: {
    backgroundColor: "#cce4f7",
  },
  pastorName: {
    fontSize: 16,
    color: "#333",
  },
  pastorNameSelected: {
    fontWeight: "bold",
    color: "#007aff",
  },
  loadingText: {
    padding: 10,
    fontStyle: "italic",
    color: "#999",
  },
  submitButton: {
    marginTop: 10,
    backgroundColor: "#007aff",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    shadowColor: "#007aff",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 18,
  },

  // Sidebar styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-start",
  },
  sidebar: {
    width: SCREEN_WIDTH * 0.75,
    backgroundColor: "#fff",
    height: "100%",
    paddingTop: 50,
    paddingHorizontal: 24,
    position: "absolute",
    left: 0,
    top: 0,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  profileSection: {
    marginBottom: 40,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    marginRight: 10,
    color: "#222",
  },
  onlineBullet: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#28a745",
  },
  profileStatus: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  sidebarButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  icon: {
    marginRight: 14,
  },
  sidebarItemText: {
    fontSize: 17,
    color: "#444",
  },

  // Menu button
  menuButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1000,
    backgroundColor: "#fff",







borderRadius: 30,
padding: 6,
shadowColor: "#000",
shadowOffset: { width: 0, height: 1 },
shadowOpacity: 0.15,
shadowRadius: 3,
elevation: 4,
},
});