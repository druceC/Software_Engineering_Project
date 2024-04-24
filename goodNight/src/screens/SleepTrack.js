import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { Accelerometer } from 'expo-sensors';
import auth from '@react-native-firebase/auth';
import { Audio } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

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
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicProgress, setMusicProgress] = useState(0);
  const [musicDuration, setMusicDuration] = useState(0);
  const soundRef = useRef(null);

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
          setSleepData((prevState) => {
            let updates = { ...prevState, asleep };
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
      console.log('User is logged in: ', user.email);
    } else {
      console.log('No user logged in.');
    }

    if (user) {
      console.log('User ID:', user.uid); // You can access the user's UID
      console.log('User Email:', user.email); // You can access the user's email
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
      setSleepData((prevState) => {
        const now = new Date();
        const updatedData = {
          ...prevState,
          sleepEnd: prevState.sleepEnd || now, // Ensure sleepEnd is set
          asleep: false,
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

  const playMusic = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(require('../../assets/asmr.mp3'));
      soundRef.current = sound;
      const status = await sound.getStatusAsync();
      setMusicDuration(status.durationMillis);
      await sound.playAsync();
      setIsMusicPlaying(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.isPlaying) {
          setMusicProgress(status.positionMillis);
        }
      });
    } catch (error) {
      console.log('Error playing music:', error);
    }
  };

  const stopMusic = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      setIsMusicPlaying(false);
      setMusicProgress(0);
    }
  };

  const handleMusicSliderChange = async (value) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(value);
      setMusicProgress(value);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.time}>{formatTime(currentTime)}</Text>
      <TouchableOpacity
        style={[styles.button, isTracking && styles.activeButton]}
        onPress={isTracking ? stopTracking : startTracking}
      >
        <Animated.View style={[styles.buttonInner, { transform: [{ scale: buttonScale }] }]}>
          {isTracking ? (
            <Text style={styles.durationText}>{formatDuration(duration)}</Text>
          ) : (
            <MaterialCommunityIcons name="power-sleep" size={80} color="#FFFFFF" />
          )}
        </Animated.View>
      </TouchableOpacity>
      <View style={styles.musicContainer}>
        <TouchableOpacity style={styles.musicButton} onPress={isMusicPlaying ? stopMusic : playMusic}>
          <MaterialCommunityIcons
            name={isMusicPlaying ? 'pause' : 'play'}
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.musicButtonText}>{isMusicPlaying ? 'Pause' : 'Raining'}</Text>
        </TouchableOpacity>
        {isMusicPlaying && (
          <Slider
            style={styles.musicSlider}
            minimumValue={0}
            maximumValue={musicDuration}
            value={musicProgress}
            onValueChange={handleMusicSliderChange}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#4A5568"
            thumbTintColor="#FFFFFF"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A202C',
  },
  time: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 40,
  },
  button: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#2D3748',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    elevation: 5,
  },
  activeButton: {
    backgroundColor: '#3182CE',
  },
  buttonInner: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#4A5568',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  musicContainer: {
    width: '80%',
    alignItems: 'center',
    backgroundColor: '#2D3748',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
    elevation: 3,
  },
  musicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A5568',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  musicButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  musicSlider: {
    width: '100%',
    height: 40,
  },
});