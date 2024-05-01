import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions, Vibration, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { Accelerometer } from 'expo-sensors';
import auth from '@react-native-firebase/auth';
import { Audio } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Alert } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';


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
  const animationRef = useRef(null); // Reference to store the animation
  const [isLoading, setIsLoading] = useState(false);

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
        const asleep = movement < 1;

        // console.log(asleep);

        setSleepData(prevState => {
          let updates = { ...prevState };

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
      // console.log('User ID:', user.uid);
      // console.log('User Email:', user.email);
    }
    const { sleepStart, sleepEnd, wakeTimes, remPeriods, lightSleepCycles, totalDuration } = data;

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
      if (animationRef.current) {
        animationRef.current.stop(); // Stop the animation
        animationRef.current = null; // Reset the reference
      }
    }
  };

  function analyzeSleepCycles(movements, timestamps) {
    const remThreshold = 0.2; // Threshold for REM sleep
    const lightSleepThreshold = 1.5; // Higher threshold for light sleep
    let sleepCycles = {
      remPeriods: [],
      lightSleepCycles: []
    };

    let isREM = false, isLightSleep = false;
    let remStartIndex = null, lightSleepStartIndex = null;

    movements.forEach((movement, index) => {
      // console.log(`Index: ${index}, Movement: ${movement}, isREM: ${isREM}, isLightSleep: ${isLightSleep}`);
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
    const animation = Animated.loop(
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
    );
    animation.start();
    animationRef.current = animation; // Store the animation controller
  };


  const playMusic = async () => {
    setIsLoading(true);
    // Simulate a delay for playing music, e.g., fetching data or preparing music
    setTimeout(() => {
      setIsMusicPlaying(true);
      setIsLoading(false);
    }, 2000); // delay of 2 seconds
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

  const handleButtonPress = () => {
    Vibration.vibrate(50);
    isTracking ? stopTracking() : startTracking();
  };

  const getGradientBackground = () => {
    // Updated colors for the gradient
    return isTracking
      ? ['#120318', '#3b5998', '#4b134f'] // Active Tracking Gradient (Dark Blue and Pink)
      : ['#4b134f', '#3b5998', '#120318']; // Inactive Tracking Gradient (Pink to Dark Blue)
  };
  const chartConfig = {
    backgroundGradientFrom: '#1E2923',
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: '#08130D',
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
  };

  const sleepStageData = {
    labels: ['10pm', '11pm', '12am', '1am', '2am', '3am', '4am', '5am', '6am'],
    datasets: [
      {
        data: [0, 1, 0, 2, 1, 2, 1, 2, 0],
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };
  const screenHeight = Dimensions.get('window').height;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <LinearGradient
          colors={getGradientBackground()}
          style={styles.background}
        />
        <Text style={styles.time}>{formatTime(currentTime)}</Text>

        <TouchableOpacity
          style={[styles.button, isTracking && styles.activeButton]}
          onPress={handleButtonPress}
          activeOpacity={0.8}
        >
          <Animated.View style={[styles.buttonInner, { transform: [{ scale: buttonScale }] }]}>
            {isTracking ? (
              <Text style={styles.durationText}>{formatDuration(duration)}</Text>
            ) : (
              <MaterialCommunityIcons name="power-sleep" size={100} color="#FFFFFF" />
            )}
          </Animated.View>
        </TouchableOpacity>
        <View style={styles.musicContainer}>
          <TouchableOpacity
            style={styles.musicButton}
            onPress={isMusicPlaying ? stopMusic : playMusic}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name={isMusicPlaying ? 'pause' : 'play'}
              size={32}
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
        <View style={styles.chartContainer}>
          {/* <LineChart
            data={sleepStageData}
            width={350}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          /> */}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 50, // Added padding at the top
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  time: {
    fontFamily: 'monospace',
    fontSize: 56,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20, // Increased space above the current time
    marginBottom: 40, // Slightly reduced bottom margin
  },
  button: {
    width: 230,
    height: 230,
    borderRadius: 110,
    backgroundColor: '#2D3748',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40, // Reduced bottom margin
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  activeButton: {
    backgroundColor: '#3182CE',
  },
  buttonInner: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#5A607D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationText: {
    //fontFamily: 'monospace',
    fontSize: 42,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  musicContainer: {
    // marginTop:"30%",
    // bottom: "0%",
    width: '80%', // Reduced the width for the music container
    alignItems: 'center',
    backgroundColor: '#2D3748',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10, // Reduced padding for a slimmer bar
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 25, // Slightly increased the bottom margin
  },
  musicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A5568',
    paddingHorizontal: 10, // Slightly reduced horizontal padding
    paddingVertical: 10, // Reduced vertical padding
    borderRadius: 10,
    marginBottom: 10, // Increased margin for spacing
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  musicButtonText: {
    fontFamily: 'monospace',
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  musicSlider: {
    width: '90%', // Reduced width for a smaller slider
    height: 30, // Reduced height for a slimmer slider
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  chart: {
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
