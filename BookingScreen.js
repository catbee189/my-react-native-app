import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Modal,
  Animated,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import SidebarModal from "./SidebarModal";
import SidebarToggle from "./SidebarToggle";

export default function ScheduleList({ currentUserId, navigation }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const scheduleSnapshot = await getDocs(collection(db, "schedules"));
        const fetchedSchedules = [];

        for (const docSnap of scheduleSnapshot.docs) {
          const data = docSnap.data();
          let userName = "Unknown";

          if (data.user_id) {
            const userDoc = await getDoc(doc(db, "users", data.user_id));
            if (userDoc.exists()) {
              userName = userDoc.data().name || "No Name";
            }
          }

          fetchedSchedules.push({
            id: docSnap.id,
            title: data.title,
            description: data.description,
            start_time: data.start_time.toDate(),
            end_time: data.end_time.toDate(),
            location: data.location,
            user_id: data.user_id,
            userName,
            pastor_id: data.user_id || null,
          });
        }

        setSchedules(fetchedSchedules);
      } catch (error) {
        console.error("Error fetching schedules: ", error);
        alert("Error loading schedules.");
      } finally {
        setLoading(false);
      }
    };

    const fetchMembers = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "==", "member"));
        const querySnapshot = await getDocs(q);
        const memberList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setMembers(memberList);
      } catch (error) {
        console.error("Failed to fetch members:", error);
      }
    };

    fetchSchedules();
    fetchMembers();
  }, []);

  const onSelectSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setNotes("");
    setSelectedMemberId("");
  };

  const onRequestBooking = async () => {
    if (!notes.trim() || !selectedSchedule || !selectedMemberId) {
      alert("Please complete all fields before requesting booking.");
      return;
    }

    try {
      setSubmitting(true);
      await addDoc(collection(db, "appointments"), {
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        member_id: selectedMemberId,
        notes: notes.trim(),
        pastor_id: selectedSchedule.pastor_id || "",
        schedule_id: selectedSchedule.id,
        status: "pending",
      });

      const member = members.find((m) => m.id === selectedMemberId);
      setSuccessData({
        title: selectedSchedule.title,
        start: selectedSchedule.start_time.toLocaleString(),
        end: selectedSchedule.end_time.toLocaleString(),
        location: selectedSchedule.location,
        pastor: selectedSchedule.userName,
        member: member?.name || "Unknown",
        notes,
      });

      setSuccessModalVisible(true);
      setNotes("");
      setSelectedSchedule(null);
      setSelectedMemberId("");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to submit booking.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SidebarToggle onOpen={() => setSidebarVisible(true)} />
      <SidebarModal visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      <Text style={styles.header}>Available Schedules</Text>
      <FlatList
        data={schedules}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isSelected = selectedSchedule?.id === item.id;
          return (
            <TouchableOpacity
              style={[styles.button, isSelected && styles.selectedButton]}
              onPress={() => onSelectSchedule(item)}
            >
              <Text style={[styles.buttonText, isSelected && styles.selectedText]}>
                {item.title}{"\n"}
                {item.start_time.toLocaleString()} - {item.end_time.toLocaleString()}{"\n"}
                Pastor: {item.userName}
              </Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text>No schedules found.</Text>}
      />

      {selectedSchedule && (
        <View style={styles.bookingContainer}>
          <Text style={styles.bookingHeader}>Request Booking for:</Text>
          <Text style={styles.bookingTitle}>{selectedSchedule.title}</Text>

          <Text>Select Member:</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedMemberId}
              onValueChange={(value) => setSelectedMemberId(value)}
              enabled={!submitting}
            >
              <Picker.Item label="Select a member" value="" />
              {members.map((member) => (
                <Picker.Item key={member.id} label={member.name} value={member.id} />
              ))}
            </Picker>
          </View>

          <TextInput
            style={styles.notesInput}
            placeholder="Enter booking notes..."
            multiline
            value={notes}
            onChangeText={setNotes}
            editable={!submitting}
          />

          <TouchableOpacity
            style={[styles.requestButton, submitting && styles.disabledButton]}
            onPress={onRequestBooking}
            disabled={submitting}
          >
            <Text style={styles.requestButtonText}>
              {submitting ? "Submitting..." : "Request Booking"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Success Modal */}
      <Modal
        visible={successModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Booking Requested!</Text>
            {successData && (
              <>
                <Text>Title: {successData.title}</Text>
                <Text>Pastor: {successData.pastor}</Text>
                <Text>Member: {successData.member}</Text>
                <Text>Start: {successData.start}</Text>
                <Text>End: {successData.end}</Text>
                <Text>Location: {successData.location}</Text>
                <Text>Notes: {successData.notes}</Text>
              </>
            )}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setSuccessModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  button: { backgroundColor: "#4a90e2", padding: 15, borderRadius: 10, marginVertical: 8 },
  selectedButton: { backgroundColor: "#014f86" },
  buttonText: { color: "#fff", fontSize: 16 },
  selectedText: { fontWeight: "bold", color: "#ffd700" },
  bookingContainer: { marginTop: 20, padding: 15, backgroundColor: "#e0e7ff", borderRadius: 10 },
  bookingHeader: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  bookingTitle: { fontSize: 16, marginBottom: 10 },
  notesInput: {
    height: 80,
    borderColor: "#aaa",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#0118D8",
    textAlignVertical: "top",
  },
  requestButton: {
    backgroundColor: "#4a90e2",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  requestButtonText: { color: "#fff", fontSize: 16 },
  disabledButton: { backgroundColor: "#999" },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: "#4a90e2",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCloseText: { color: "#fff", fontWeight: "bold" },
});
