import React, { useState } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { format, parse, isAfter } from 'date-fns';
import firestore from '@react-native-firebase/firestore';

export const SleepTrackMenu = () => {
  const [bedTime, setBedTime] = useState('');
  const [wakeUpTime, setWakeUpTime] = useState('');
  const [awakenings, setAwakenings] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    // Validate the input data
    if (!bedTime || !wakeUpTime || !awakenings) {
      Alert.alert('Error', 'Please fill in all the required fields.');
      return;
    }

    const parsedBedTime = parse(bedTime, 'HH:mm', new Date());
    const parsedWakeUpTime = parse(wakeUpTime, 'HH:mm', new Date());

    if (!isAfter(parsedWakeUpTime, parsedBedTime)) {
      Alert.alert('Error', 'Wake up time must be after bed time.');
      return;
    }

    try {
      // Save the sleep data to Firebase Firestore
      await firestore().collection('sleepData').add({
        bedTime: parsedBedTime,
        wakeUpTime: parsedWakeUpTime,
        awakenings: parseInt(awakenings),
        notes,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // Reset the form
      setBedTime('');
      setWakeUpTime('');
      setAwakenings('');
      setNotes('');

      Alert.alert('Success', 'Sleep data recorded successfully.');
    } catch (error) {
      console.error('Error saving sleep data:', error);
      Alert.alert('Error', 'An error occurred while saving sleep data.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Record Sleep Data</Text>
      <TextInput
        label="Bed Time"
        value={bedTime}
        onChangeText={setBedTime}
        style={styles.input}
        keyboardType="numeric"
        placeholder="HH:mm"
      />
      <TextInput
        label="Wake Up Time"
        value={wakeUpTime}
        onChangeText={setWakeUpTime}
        style={styles.input}
        keyboardType="numeric"
        placeholder="HH:mm"
      />
      <TextInput
        label="Number of Awakenings"
        value={awakenings}
        onChangeText={setAwakenings}
        style={styles.input}
        keyboardType="numeric"
      />
      <TextInput
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        style={styles.input}
        multiline
      />
      <Button mode="contained" onPress={handleSubmit} style={styles.button}>
        Submit
      </Button>
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
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});