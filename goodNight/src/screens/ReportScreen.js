import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, Modal, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LineChart } from 'react-native-chart-kit';

export const ReportScreen = () => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sleepData, setSleepData] = useState([]);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
    fetchSleepData(currentDate);
  };

  const fetchSleepData = async (selectedDate) => {
    const user = auth().currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be logged in to view sleep data.');
      return;
    }

    const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7); // Adjust to fetch data for one week

    try {
      const snapshot = await firestore()
        .collection('sleepData')
        .where('uid', '==', user.uid)
        .where('createdAt', '>=', firestore.Timestamp.fromDate(startDate))
        .where('createdAt', '<=', firestore.Timestamp.fromDate(endDate))
        .orderBy('createdAt')
        .get();

      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          label: new Date(docData.createdAt.seconds * 1000).toLocaleDateString(),
          value: docData.totalDuration,
        };
      });
      setSleepData(data);
    } catch (error) {
      console.error('Error fetching sleep data:', error);
      Alert.alert('Error', 'Failed to fetch sleep data.');
    }
  };

  const chartConfig = {
    backgroundColor: "#000000",
    backgroundGradientFrom: "#1E2923",
    backgroundGradientTo: "#08130D",
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#ffa726"
    }
  };

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDatePicker}
        onRequestClose={() => {
          setShowDatePicker(!showDatePicker);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode={'date'}
              is24Hour={true}
              display="default"
              onChange={onChange}
            />
            <Button title="Close" onPress={() => setShowDatePicker(!showDatePicker)} />
          </View>
        </View>
      </Modal>
      
      <TouchableOpacity style={styles.button} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.buttonText}>Choose Date</Text>
      </TouchableOpacity>
      {sleepData.length > 0 && (
        <ScrollView horizontal={true}>
          <LineChart
            data={{
              labels: sleepData.map(entry => entry.label),
              datasets: [{
                data: sleepData.map(entry => entry.value)
              }]
            }}
            width={Dimensions.get("window").width * 1.5}
            height={220}
            yAxisLabel=""
            yAxisSuffix="s"
            yAxisInterval={1}
            chartConfig={chartConfig}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
          />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f8',
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  }
});
