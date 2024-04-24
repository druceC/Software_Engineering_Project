import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, Alert, Button } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { getAuth } from 'firebase/auth';

export const SleepTrackMenu = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [sleepData, setSleepData] = useState({
    asleep: false,
    sleepStart: null,
    sleepEnd: null,
    wakeTimes: []
  });

  useEffect(() => {
    let accelerometerSubscription;

    if (isTracking) {
      Accelerometer.setUpdateInterval(1000); // update every second
      accelerometerSubscription = Accelerometer.addListener(({ x, y, z }) => {
        const movement = Math.sqrt(x * x + y * y + z * z);
        const asleep = movement < 0.02;

        if (asleep !== sleepData.asleep) {
          setSleepData(prevState => {
            let updates = {...prevState, asleep};
            if (asleep && !prevState.sleepStart) {
              updates.sleepStart = new Date(); // First time falling asleep
            }
            if (!asleep && prevState.asleep) {
              updates.wakeTimes = [...prevState.wakeTimes, new Date()]; // Detected a wakeup
            }
            return updates;
          });
        }
      });
    }

    return () => {
      accelerometerSubscription?.remove();
    };
  }, [isTracking, sleepData.asleep]);

  const saveSleepData = async (data) => {
    //const auth = getAuth();
    //const user = auth.currentUser;
    const { sleepStart, sleepEnd, wakeTimes } = data;
    // Only attempt to save data if both sleepStart and sleepEnd are not null
    if (sleepStart && sleepEnd) {
      try {
        await firestore().collection('sleepData').add({
          //uid: user.uid, 
          sleepStart,
          sleepEnd,
          wakeTimes,
          totalDuration: (sleepEnd.getTime() - sleepStart.getTime()) / 1000, // Calculate duration in seconds
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
        Alert.alert('Success', 'Sleep data saved successfully');
      } catch (error) {
        console.error('Error saving sleep data:', error);
        Alert.alert('Error', 'An error occurred while saving sleep data.');
      }
    } else {
      console.error('Error: sleepStart or sleepEnd is null');
      Alert.alert('Error', 'Sleep tracking data incomplete.');
    }
  };
  
  const stopTracking = () => {
    if (isTracking) {
      setIsTracking(false);
      setSleepData(prevState => {
        const now = new Date();
        const updatedData = {
          ...prevState,
          sleepEnd: prevState.sleepEnd || now,  // Ensure sleepEnd is set
          asleep: false
        };
        saveSleepData(updatedData);
        return updatedData;
      });
    }
  };  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sleep Tracking</Text>
      <Text>{isTracking ? 'Sleep tracking is active' : 'Sleep tracking is inactive'}</Text>
      <Button title={isTracking ? 'Stop Tracking' : 'Start Tracking'} onPress={isTracking ? stopTracking : () => setIsTracking(true)} />
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
