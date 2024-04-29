import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, Modal, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LineChart } from 'react-native-chart-kit';
import { format, subDays, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

export const ReportScreen = () => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sleepData, setSleepData] = useState([]);
  const [sleepQuality, setSleepQuality] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRange, setSelectedRange] = useState('daily');

  useEffect(() => {
    fetchSleepData(date);
  }, [date]);

  useEffect(() => {
    if (selectedRange === 'daily') {
      fetchSleepData(date);
    } else if (selectedRange === 'weekly') {
      fetchWeeklyData(date);
    } else if (selectedRange === 'monthly') {
      fetchMonthlyData(date);
    }
  }, [selectedRange, date]); // Ensuring this runs when range or date changes

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
    setShowDatePicker(false);
  };

  const fetchSleepData = async (selectedDate) => {
    setIsLoading(true);
    try {
      const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1);
    
      const snapshot = await firestore()
        .collection('sleepData')
        .where('sleepStart', '>=', startDate)
        .where('sleepStart', '<', endDate)
        .get();
    
      const rawData = snapshot.docs.map(doc => doc.data());
      setSleepData(rawData);
      setSleepQuality(calculateSleepQuality(rawData, 'daily'));
    } catch (error) {
      console.error('Error fetching sleep data:', error);
      Alert.alert('Error', 'Failed to fetch sleep data.');
    }
    setIsLoading(false);
  };

  const fetchWeeklyData = async (selectedDate) => {
    setIsLoading(true);
    try {
      const startOfWeekDate = startOfWeek(selectedDate);
      const endOfWeekDate = endOfWeek(selectedDate);

      const snapshot = await firestore()
        .collection('sleepData')
        .where('sleepStart', '>=', startOfWeekDate)
        .where('sleepStart', '<=', endOfWeekDate)
        .get();

      const rawData = snapshot.docs.map(doc => doc.data());
      setWeeklyData(rawData);
      setSleepQuality(calculateSleepQuality(rawData));
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      Alert.alert('Error', 'Failed to fetch weekly data.');
    }
    setIsLoading(false);
  };

  const fetchMonthlyData = async (selectedDate) => {
    setIsLoading(true);
    try {
      const startOfMonthDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endOfMonthDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

      const snapshot = await firestore()
        .collection('sleepData')
        .where('sleepStart', '>=', startOfMonthDate)
        .where('sleepStart', '<=', endOfMonthDate)
        .get();

      const rawData = snapshot.docs.map(doc => doc.data());
      setMonthlyData(rawData);
      setSleepQuality(calculateSleepQuality(rawData));
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      Alert.alert('Error', 'Failed to fetch monthly data.');
    }
    setIsLoading(false);
  };

  const calculateSleepQuality = (data, range) => {
    if (range === 'daily') {
      const formattedData = data.map(entry => ({
        label: format(entry.sleepStart.toDate(), 'HH:mm'),
        value: entry.remPeriods.length
      }));
  
      const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1);
      const allDates = eachDayOfInterval({ start: startDate, end: endDate });
  
      const filledData = allDates.map(currentDate => {
        const match = formattedData.find(entry => entry.label === format(currentDate, 'HH:mm'));
        return match ? match : { label: format(currentDate, 'HH:mm'), value: 0 };
      });

      return filledData;
    } else if (selectedRange === 'weekly') {
      const formattedData = data.map(entry => ({
        label: format(entry.sleepStart.toDate(), 'EEE'),
        value: entry.remPeriods.length
      }));

      const startOfWeekDate = startOfWeek(date);
      const endOfWeekDate = endOfWeek(date);
      const allDates = eachDayOfInterval({ start: startOfWeekDate, end: endOfWeekDate });

      const filledData = allDates.map(currentDate => {
        const match = formattedData.find(entry => entry.label === format(currentDate, 'EEE'));
        return match ? match : { label: format(currentDate, 'EEE'), value: 0 };
      });

      return filledData;
    } else if (selectedRange === 'monthly') {
      const formattedData = data.map(entry => ({
        label: format(entry.sleepStart.toDate(), 'dd'),
        value: entry.remPeriods.length
      }));

      const startOfMonthDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonthDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const allDates = eachDayOfInterval({ start: startOfMonthDate, end: endOfMonthDate });

      const filledData = allDates.map(currentDate => {
        const match = formattedData.find(entry => entry.label === format(currentDate, 'dd'));
        return match ? match : { label: format(currentDate, 'dd'), value: 0 };
      });

      return filledData;
    }
  };

  const calculateAverageSleepDuration = (data) => {
    if (data.length === 0) {
      return 0;
    }

    const totalSleepDuration = data.reduce((sum, entry) => sum + entry.totalDuration, 0);
    return (totalSleepDuration / data.length / 3600).toFixed(2);
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

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyStateContainer}>
        <Text style={styles.emptyStateText}>No sleep data available for the selected range.</Text>
      </View>
    );
  };

  const renderLoadingState = () => {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  };

  const renderRangeButtons = () => {
    return (
      <View style={styles.rangeButtonsContainer}>
        <TouchableOpacity
          style={[styles.rangeButton, selectedRange === 'daily' && styles.selectedRangeButton]}
          onPress={() => setSelectedRange('daily')}
        >
          <Text style={[styles.rangeButtonText, selectedRange === 'daily' && styles.selectedRangeButtonText]}>Daily</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.rangeButton, selectedRange === 'weekly' && styles.selectedRangeButton]}
          onPress={() => setSelectedRange('weekly')}
        >
          <Text style={[styles.rangeButtonText, selectedRange === 'weekly' && styles.selectedRangeButtonText]}>Weekly</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.rangeButton, selectedRange === 'monthly' && styles.selectedRangeButton]}
          onPress={() => setSelectedRange('monthly')}
        >
          <Text style={[styles.rangeButtonText, selectedRange === 'monthly' && styles.selectedRangeButtonText]}>Monthly</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderChart = () => {
    return (
      <ScrollView horizontal={true}>
        <LineChart
          data={{
            labels: sleepQuality.map(entry => entry.label),
            datasets: [{
              data: sleepQuality.map(entry => entry.value)
            }]
          }}
          width={Dimensions.get("window").width * 1.5}
          height={220}
          yAxisLabel="REM Cycles "
          yAxisSuffix=""
          yAxisInterval={1}
          chartConfig={chartConfig}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />
      </ScrollView>
    );
  };

  const renderSummary = () => {
    let averageSleepDuration = 0;
    let dataSource = [];

    if (selectedRange === 'daily') {
      dataSource = sleepData;
    } else if (selectedRange === 'weekly') {
      dataSource = weeklyData;
    } else if (selectedRange === 'monthly') {
      dataSource = monthlyData;
    }

    averageSleepDuration = calculateAverageSleepDuration(dataSource);

    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Average Sleep Duration:</Text>
        <Text style={styles.summaryValue}>{averageSleepDuration} hours</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.buttonText}>Choose Date</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDatePicker}
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode={'date'}
              display="default"
              onChange={onChange}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowDatePicker(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {renderRangeButtons()}

      {isLoading ? (
        renderLoadingState()
      ) : sleepQuality.length > 0 ? (
        renderChart()
      ) : (
        renderEmptyState()
      )}

      {renderSummary()}
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
    marginBottom: 20,
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
  },
  closeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 10,
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#888',
  },
  summaryContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  rangeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  rangeButton: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  selectedRangeButton: {
    backgroundColor: '#6200ee',
  },
  rangeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedRangeButtonText: {
    color: '#ffffff',
  },
});