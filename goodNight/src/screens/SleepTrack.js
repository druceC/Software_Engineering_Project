import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Alert, Button } from 'react-native';

import firestore from '@react-native-firebase/firestore';
import { Accelerometer, Gyroscope } from 'expo-sensors';


export const SleepTrackMenu = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [sleepData, setSleepData] = useState({ asleep: false });

  useEffect(() => {
    let accelerometerSubscription = null;
    let gyroscopeSubscription = null;

    const startTracking = () => {
      setIsTracking(true);

      // Start listening to accelerometer data
      accelerometerSubscription = Accelerometer.addListener((data) => {
        const { x, y, z } = data;
        // Example sleep detection logic based on movement
        const movement = Math.sqrt(x*x + y*y + z*z);
        const asleep = movement < 0.02; // Low movement threshold for sleep detection

        if (asleep !== sleepData.asleep) {
          setSleepData({ asleep });
          saveSleepData({ asleep });
        }
      });

      // Start listening to gyroscope data - optional based on further needs
      gyroscopeSubscription = Gyroscope.addListener((data) => {
        const { x, y, z } = data;
        // Implement further motion analysis if needed
      });
    };

    const stopTracking = () => {
      setIsTracking(false);
      accelerometerSubscription && accelerometerSubscription.remove();
      gyroscopeSubscription && gyroscopeSubscription.remove();
    };

    if (isTracking) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [isTracking, sleepData]);

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

  const toggleTracking = () => {
    setIsTracking((prevState) => !prevState);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sleep Tracking</Text>
      <Text>
        {isTracking ? 'Sleep tracking is active' : 'Sleep tracking is inactive'}
      </Text>
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
