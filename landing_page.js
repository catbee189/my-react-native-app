// screens/LandingPage.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import Navbar from './Navbar';
import BottomBar from './BottomBar';

export default function LandingPage({ route   }) {
const { user } = route.params;
  return (
   
   
    <SafeAreaView style={styles.wrapper}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1508780709619-79562169bc64' }}
        style={styles.background}
        resizeMode="cover"
      >
  <Navbar user={user} />
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>Welcome, {user?.name || 'Guest'}!</Text>
            <Text style={styles.heroSubtitle}>“Faith. Hope. Love.”</Text>
          </View>

          <View style={styles.section}>
            <Image
              source={{ uri: 'https://th.bing.com/th/id/OIP.PIlBFoOupsgAsMMPC7vrJwHaHa?w=184&h=184' }}
              style={styles.pastorImage}
            />
            <Text style={styles.sectionText}>
              Pastor John has dedicated his life to ministry for over 15 years, leading people with wisdom,
              compassion, and unwavering faith in Christ.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Mission</Text>
            <Text style={styles.sectionText}>
              To reach, teach, and empower people through the message of Jesus. We believe in community, service, and love.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <Text style={styles.sectionText}>📧 pastorjohn@example.com</Text>
            <Text style={styles.sectionText}>📞 +1 (234) 567-890</Text>
            <Text style={styles.sectionText}>🌐 facebook.com/pastorjohn</Text>
          </View>
        </ScrollView>

 <BottomBar user={user} />  
  </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  background: { flex: 1 },
  container: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 100,
  },
  hero: {
    backgroundColor: 'rgba(43, 108, 176, 0.85)',
    padding: 30,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#e0f0ff',
    marginTop: 8,
  },
  pastorImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#2b6cb0',
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 25,
    alignItems: 'center',
    width: '100%',
    borderRadius: 12,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2b6cb0',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 10,
    color: '#2d3748',
  },
});
