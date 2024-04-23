import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, Alert, Button } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { Accelerometer, Gyroscope } from 'react-native-sensors';

export const SleepTrackMenu = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [sleepData, setSleepData] = useState({ asleep: false });

  const saveSleepData = async (data) => {
    try {
      await firestore().collection('sleepData').add({
        ...data,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving sleep data:', error);
      Alert.alert('Error', 'An error occurred while saving sleep data.');
    }
  };

  useEffect(() => {
    let accelerometerSubscription;
    let gyroscopeSubscription;

    if (isTracking) {
      accelerometerSubscription = Accelerometer.addListener(({ x, y, z }) => {
        const movement = Math.sqrt(x * x + y * y + z * z);
        const asleep = movement < 0.02;
        if (asleep !== sleepData.asleep) {
          setSleepData({ asleep });
          saveSleepData({ asleep });
        }
      });

      gyroscopeSubscription = Gyroscope.addListener((data) => {
        // Implement gyroscope logic if needed
      });
    }

    return () => {
      accelerometerSubscription?.remove();
      gyroscopeSubscription?.remove();
    };
  }, [isTracking]);  // Removed sleepData from dependencies

  const toggleTracking = useCallback(() => {
    setIsTracking((prevState) => !prevState);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sleep Tracking</Text>
      <Text>{isTracking ? 'Sleep tracking is active' : 'Sleep tracking is inactive'}</Text>
      <Button title={isTracking ? 'Stop Tracking' : 'Start Tracking'} onPress={toggleTracking} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
