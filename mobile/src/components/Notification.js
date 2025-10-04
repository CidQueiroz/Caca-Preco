import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const Notification = ({ message, type, onHide }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0
  const slideAnim = useRef(new Animated.Value(width)).current; // Initial value for slide: off-screen right

  useEffect(() => {
    if (message) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0, // Slide to 0 (right edge of screen)
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Animate out after 2.5 seconds
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: width, // Slide back off-screen right
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => onHide && onHide());
        }, 2500); // Display duration
      });
    }
  }, [message]);

  if (!message) {
    return null;
  }

  return (
    <Animated.View style={[
      styles.notificationContainer,
      type === 'success' ? styles.success : styles.error,
      { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }
    ]}>
      <Text style={styles.messageText}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  notificationContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    padding: 15,
    borderRadius: 8,
    zIndex: 1000,
    elevation: 5, // For Android shadow
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
  },
  success: {
    backgroundColor: '#28a745',
  },
  error: {
    backgroundColor: '#dc3545',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Notification;