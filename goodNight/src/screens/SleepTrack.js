import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { Accelerometer } from 'expo-sensors';
import auth from '@react-native-firebase/auth';
import { Audio } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Alert } from 'react-native';

export const SleepTrackMenu = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sleepData, setSleepData] = useState({
    asleep: false,
    sleepStart: null,
    sleepEnd: null,
    wakeTimes: [],
    movements: [],  
    timestamps: []
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
    let trigger = false;

    if (isTracking) {
      Accelerometer.setUpdateInterval(1000); // update every second
      accelerometerSubscription = Accelerometer.addListener(({ x, y, z }) => {
        const movement = Math.sqrt(x * x + y * y + z * z);
        const asleep = movement < 1.5;
        
        console.log(asleep);

        setSleepData(prevState => {
          let updates = {...prevState};

          if (asleep !== prevState.asleep) {
            if (asleep && !trigger) {
                // Set sleepStart only if it's null and the state is transitioning to asleep
                updates.sleepStart = new Date();
                trigger = true;
            }
            if (!asleep && prevState.asleep) {
                // Log the wake time only if transitioning from asleep to awake
                updates.wakeTimes = [...prevState.wakeTimes, new Date()];
            }
          }

          // Update movement and timestamps regardless of sleep state change
          const newTimestamp = new Date();
          updates.movements = [...prevState.movements, movement];
          updates.timestamps = [...prevState.timestamps, newTimestamp];
          updates.asleep = asleep;

          return updates;
        });
      });
    }

    return () => {
      if (accelerometerSubscription) {
        accelerometerSubscription.remove();
      }
    };
  }, [isTracking]);

  
  const saveSleepData = async (data) => {
    const user = auth().currentUser;
  
    if (user) {
      console.log('User ID:', user.uid);
      console.log('User Email:', user.email);
    }
    const { sleepStart, sleepEnd, wakeTimes, remPeriods, lightSleepCycles, totalDuration } = data;
  
    const remDuration = remPeriods.reduce((total, period) => total + period.duration, 0);
    const lightSleepDuration = lightSleepCycles.reduce((total, cycle) => total + cycle.duration, 0);
  
    const remPercentage = (remDuration / totalDuration) * 100;
    const lightSleepPercentage = (lightSleepDuration / totalDuration) * 100;
  
    if (sleepStart && sleepEnd) {
      try {
        await firestore().collection('sleepData').add({
          uid: user.uid,
          sleepStart,
          sleepEnd,
          wakeTimes,
          totalDuration,
          remPeriods,
          lightSleepCycles,
          remPercentage,
          lightSleepPercentage,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
        Alert.alert('Success', 'Sleep data saved successfully');
        setSleepData(prevState => ({
          ...prevState,
          wakeTimes: []
        }));
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
        const { remPeriods, lightSleepCycles } = analyzeSleepCycles(prevState.movements, prevState.timestamps);
        const totalDuration = duration;
        
        const updatedData = {
          ...prevState,
          sleepEnd: now,
          asleep: false,
          movements: [],
          timestamps: [],
          remPeriods: remPeriods,
          lightSleepCycles: lightSleepCycles, 
          totalDuration,
        };
        saveSleepData(updatedData);
        return updatedData;
      });
    }
  };  
  
  function analyzeSleepCycles(movements, timestamps) {
    const remThreshold = 1.9; // Threshold for REM sleep
    const lightSleepThreshold = 2.0; // Higher threshold for light sleep
    let sleepCycles = {
        remPeriods: [],
        lightSleepCycles: []
    };

    let isREM = false, isLightSleep = false;
    let remStartIndex = null, lightSleepStartIndex = null;

    movements.forEach((movement, index) => {
      console.log(`Index: ${index}, Movement: ${movement}, isREM: ${isREM}, isLightSleep: ${isLightSleep}`);
        // Handle REM sleep detection
        if (movement <= remThreshold && !isREM) {
            isREM = true;
            remStartIndex = index;
        } else if (movement > remThreshold && isREM) {
            isREM = false;
            if (remStartIndex !== null) {
                sleepCycles.remPeriods.push({
                    start: timestamps[remStartIndex],
                    end: timestamps[index],
                    duration: (timestamps[index] - timestamps[remStartIndex]) / 1000 // Duration in seconds
                });
                remStartIndex = null; // Reset REM start index after logging the cycle
            }
        }

        // Handle light sleep detection
        if (movement <= lightSleepThreshold && !isLightSleep) {
            isLightSleep = true;
            lightSleepStartIndex = index;
        } else if (movement > lightSleepThreshold && isLightSleep) {
            isLightSleep = false;
            if (lightSleepStartIndex !== null) {
                sleepCycles.lightSleepCycles.push({
                    start: timestamps[lightSleepStartIndex],
                    end: timestamps[index],
                    duration: (timestamps[index] - timestamps[lightSleepStartIndex]) / 1000 // Duration in seconds
                });
                lightSleepStartIndex = null; // Reset light sleep start index after logging the cycle
            }
        }
    });

    // Handle case where the last detected movement still suggests REM or light sleep
    if (isREM && remStartIndex !== null) {
        sleepCycles.remPeriods.push({
            start: timestamps[remStartIndex],
            end: timestamps[movements.length - 1],
            duration: (timestamps[movements.length - 1] - timestamps[remStartIndex]) / 1000 // Duration in seconds
        });
    }
    if (isLightSleep && lightSleepStartIndex !== null) {
        sleepCycles.lightSleepCycles.push({
            start: timestamps[lightSleepStartIndex],
            end: timestamps[movements.length - 1],
            duration: (timestamps[movements.length - 1] - timestamps[lightSleepStartIndex]) / 1000 // Duration in seconds
        });
    }

    return sleepCycles;
  }

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