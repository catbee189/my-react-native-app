import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function SidebarToggle({ onOpen }) {
  return (
    
    <TouchableOpacity onPress={onOpen} style={styles.toggle}>
      <Text style={styles.text}>☰</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  toggle: {
    padding: 12,
    marginTop: 20,
    marginLeft: 12,
  },
  text: {
    fontSize: 24,
    color: '#000',
  },
});
