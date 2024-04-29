import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import DateTimePicker from '@react-native-community/datetimepicker';

export const ReportScreen = () => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sleepData, setSleepData] = useState(null);

  // Code for date picking -> uses android DateTimePicker
  const onChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const currentDate = selectedDate;
      setDate(currentDate);
      fetchSleepData(currentDate);
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const fetchSleepData = async (selectedDate) => {
    const user = auth().currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be logged in to view sleep data.');
      return;
    }
  
    const startDate = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endDate = new Date(selectedDate.setHours(23, 59, 59, 999));
  
    try {
      const snapshot = await firestore()
      // Searching for data from firebase where
      // user id == currently logged in user
      // Exists in Firebase
        .collection('sleepData')
        .where('uid', '==', user.uid)
        .where('createdAt', '>=', firestore.Timestamp.fromDate(startDate))
        .where('createdAt', '<=', firestore.Timestamp.fromDate(endDate))
        .get();
  
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          // Fetches the following data from firestore
          sleepStart: docData.sleepStart,
          sleepEnd: docData.sleepEnd,
          lightSleepCycles: docData.lightSleepCycles || [],
          remPeriods: docData.remPeriods || [],
          wakeTimes: docData.wakeTimes || [],
          totalDuration: docData.totalDuration || 0,
        };
      });
      setSleepData(data);
    } catch (error) {
      console.error('Error fetching sleep data:', error);
      Alert.alert('Error', 'Failed to fetch sleep data.');
    }
  };  

  return (
    <View style={styles.container}>
    <Button onPress={showDatepicker} title="Choose a date" />
    {showDatePicker && (
      <DateTimePicker
        value={date}
        mode="date"
        display="default"
        onChange={onChange}
      />
    )}
    {sleepData && sleepData.map((entry, index) => (
      <View key={index} style={styles.dataContainer}>
        {/* Code for printing data on screen */}
        <Text>Sleep Data for {new Date(entry.sleepStart.seconds * 1000).toLocaleDateString()}:</Text>
        <Text>Sleep Start: {new Date(entry.sleepStart.seconds * 1000).toLocaleTimeString()}</Text>
        <Text>Sleep End: {new Date(entry.sleepEnd.seconds * 1000).toLocaleTimeString()}</Text>
        <Text>Total Duration: {entry.totalDuration} seconds</Text>
        <Text>Light Sleep Cycles:</Text>
        {entry.lightSleepCycles.map((cycle, cycleIndex) => (
          <Text key={cycleIndex}>
            Start: {new Date(cycle.start.seconds * 1000).toLocaleTimeString()}, 
            End: {new Date(cycle.end.seconds * 1000).toLocaleTimeString()}
          </Text>
        ))}
        <Text>REM Periods:</Text>
        {entry.remPeriods.map((period, periodIndex) => (
          <Text key={periodIndex}>
            Start: {new Date(period.start.seconds * 1000).toLocaleTimeString()}, 
            End: {new Date(period.end.seconds * 1000).toLocaleTimeString()}
          </Text>
        ))}
        <Text>Wake Times:</Text>
        {entry.wakeTimes.map((wakeTime, wakeIndex) => (
          <Text key={wakeIndex}>{new Date(wakeTime.seconds * 1000).toLocaleTimeString()}</Text>
        ))}
      </View>
    ))}
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dataContainer: {
    marginTop: 20,
  },
});
