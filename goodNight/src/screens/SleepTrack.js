import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Alert, TouchableOpacity, Animated } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { Accelerometer } from 'expo-sensors';
import auth from '@react-native-firebase/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const SleepTrackMenu = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sleepData, setSleepData] = useState({
    asleep: false,
    sleepStart: null,
    sleepEnd: null,
    wakeTimes: [],
  });
  const [duration, setDuration] = useState(0);
  const [buttonScale] = useState(new Animated.Value(1));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    let interval;

    if (isTracking) {
      interval = setInterval(() => {
        setDuration((prevDuration) => prevDuration + 1);
      }, 1000);
    } else {
      setDuration(0);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isTracking]);

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

  const formatTime = (time) => {
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (duration) => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const startTracking = () => {
    setIsTracking(true);
    animateButton();
  };

  const animateButton = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="sleep" size={24} color="#fff" />
        <Text style={styles.title}>Sleep Monitoring</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <TouchableOpacity
          style={[
            styles.button,
            isTracking ? styles.stopButton : styles.startButton,
          ]}
          onPress={isTracking ? stopTracking : startTracking}
        >
          <Animated.View
            style={[
              styles.buttonInner,
              { transform: [{ scale: buttonScale }] },
            ]}
          >
            <Text style={styles.buttonText}>
              {isTracking ? 'Stop' : 'Start'}
            </Text>
          </Animated.View>
        </TouchableOpacity>
        {isTracking && (
          <Text style={styles.durationText}>
            {formatDuration(duration)}
          </Text>
        )}
        <Text style={styles.description}>
          Monitor your sleep patterns and quality using your phone's sensors.
        </Text>
      </View>
      <View style={styles.footer}>
        <MaterialCommunityIcons name="moon-waning-crescent" size={80} color="#9b59b6" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f0ff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
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
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 24,
  },
  button: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
  },
  buttonInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#2ecc71',
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
  durationText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#34495e',
    textAlign: 'center',
    marginBottom: 24,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 32,
  },
});