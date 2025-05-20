// components/AnimatedInput.js
import React, { useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  TextInput,
  View,
  Text,
} from 'react-native';

const AnimatedInput = ({ label, placeholder, secureTextEntry }) => {
  const [isFocused, setIsFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ccc', '#007BFF'],
  });

  const borderWidth = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  });

  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View
        style={[
          styles.animatedInputContainer,
          {
            borderBottomColor: borderColor,
            borderBottomWidth: borderWidth,
          },
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#888"
          secureTextEntry={secureTextEntry}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  animatedInputContainer: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  input: {
    height: 40,
    fontSize: 16,
    paddingHorizontal: 10,
  },
});

export default AnimatedInput;
