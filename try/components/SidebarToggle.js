import { Text, TouchableOpacity } from 'react-native';

export default function SidebarToggle({ onOpen }) {
  return (
    <TouchableOpacity onPress={onOpen}>
      <Text style={{ fontSize: 18, margin: 10 }}>☰ Open Sidebar</Text>
    </TouchableOpacity>
  );
}
