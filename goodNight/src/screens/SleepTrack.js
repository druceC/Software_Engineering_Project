import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Alert, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { Accelerometer } from 'expo-sensors';
import auth from '@react-native-firebase/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const SleepTrackMenu = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [sleepData, setSleepData] = useState({
    asleep: false,
    sleepStart: null,
    sleepEnd: null,
    wakeTimes: [],
  });

  useEffect(() => {
    let accelerometerSubscription;

    if (isTracking) {
      Accelerometer.setUpdateInterval(1000); // update every second
      accelerometerSubscription = Accelerometer.addListener(({ x, y, z }) => {
        const movement = Math.sqrt(x * x + y * y + z * z);
        const asleep = movement < 1;
        console.log(asleep);
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
    const user = auth().currentUser;

    if (user) {
      console.log("User is logged in: ", user.email);
    } else {
      console.log("No user logged in.");
    }
  
    if (user) {
      console.log("User ID:", user.uid); // You can access the user's UID
      console.log("User Email:", user.email); // You can access the user's email
    }
    const { sleepStart, sleepEnd, wakeTimes } = data;
    // Only attempt to save data if both sleepStart and sleepEnd are not null
    if (sleepStart && sleepEnd) {
      try {
        await firestore().collection('sleepData').add({
          uid: user.uid, 
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
      <View style={styles.header}>
        <MaterialCommunityIcons name="sleep" size={24} color="#fff" />
        <Text style={styles.title}>Sleep Tracker</Text>
      </View>
      <View style={styles.content}>
        <TouchableOpacity
          style={[
            styles.button,
            isTracking ? styles.stopButton : styles.startButton,
          ]}
          onPress={isTracking ? stopTracking : () => setIsTracking(true)}
        >
          <Text style={styles.buttonText}>
            {isTracking ? 'Stop Sleep Tracking' : 'Start Sleep Tracking'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.description}>
          Track your sleep patterns and quality using your phone's sensors.
        </Text>
      </View>
      <View style={styles.footer}>
        <MaterialCommunityIcons name="moon-waning-crescent" size={80} color="#4a4a4a" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  startButton: {
    backgroundColor: '#3498db',
  },
  stopButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#4a4a4a',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 32,
  },
});