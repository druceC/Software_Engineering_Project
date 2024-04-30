import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView, SafeAreaView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import DateTimePicker from '@react-native-community/datetimepicker';

export const ReportScreen = () => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sleepData, setSleepData] = useState(null);

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
        .collection('sleepData')
        .where('uid', '==', user.uid)
        .where('sleepStart', '>=', firestore.Timestamp.fromDate(startDate))
        .where('sleepStart', '<', firestore.Timestamp.fromDate(endDate))
        .get();

      const data = snapshot.docs.map((doc) => {
        const docData = doc.data();
        return {
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

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {sleepData && sleepData.map((entry, index) => (
          <View key={index} style={styles.dataContainer}>
            <Text style={styles.dataHeader}>Sleep Data for {new Date(entry.sleepStart.seconds * 1000).toLocaleDateString()}:</Text>
            <Text>Sleep Start: {new Date(entry.sleepStart.seconds * 1000).toLocaleTimeString()}</Text>
            <Text>Sleep End: {new Date(entry.sleepEnd.seconds * 1000).toLocaleTimeString()}</Text>
            <Text>Total Duration: {formatDuration(entry.totalDuration)}</Text>
            
            {entry.lightSleepCycles.length > 0 && (
              <>
                <Text>Light Sleep Cycles:</Text>
                {entry.lightSleepCycles.map((cycle, idx) => (
                  <Text key={idx}>
                    Start: {new Date(cycle.start.seconds * 1000).toLocaleTimeString()}, 
                    End: {new Date(cycle.end.seconds * 1000).toLocaleTimeString()}
                  </Text>
                ))}
              </>
            )}
            
            {entry.remPeriods.length > 0 && (
              <>
                <Text>REM Periods:</Text>
                {entry.remPeriods.map((period, idx) => (
                  <Text key={idx}>
                    Start: {new Date(period.start.seconds * 1000).toLocaleTimeString()}, 
                    End: {new Date(period.end.seconds * 1000).toLocaleTimeString()}
                  </Text>
                ))}
              </>
            )}
            
            {entry.wakeTimes.length > 0 && (
              <>
                <Text>Wake Times:</Text>
                {entry.wakeTimes.map((wakeTime, idx) => (
                  <Text key={idx}>
                    Time: {new Date(wakeTime.seconds * 1000).toLocaleTimeString()}
                  </Text>
                ))}
              </>
            )}
  
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <Button onPress={showDatepicker} title="Choose Date" color="#6200ee" />
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onChange}
          />
        )}
      </View>
    </SafeAreaView>
  );  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f8',
  },
  scrollContainer: {
    flex: 1,
  },
  dataContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center', // Centers all child components horizontally
  },
  dataHeader: {
    fontSize: 18, // Increased font size
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center', // Center text horizontally
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#ffffff',
    alignItems: 'center', // Center the button horizontally
  },
});
