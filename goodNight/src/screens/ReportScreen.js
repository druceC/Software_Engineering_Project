import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { Avatar, Title, Paragraph, Button, Text, List, useTheme, Card, TouchableRipple } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ProgressChart } from 'react-native-chart-kit';
import { PieChart } from "react-native-gifted-charts";

export const ReportScreen = () => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sleepData, setSleepData] = useState(null);
  const [lightSleepPercentage, setLightSleepPercentage] = useState(0);
  const [remPercentage, setRemPercentage] = useState(0);
  const [remainPercentage, setRemainPercentage] = useState(0);

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

  const formattedDate = date.toLocaleDateString(); // You can customize this format as needed

  console.log(formattedDate);

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

  const calculateSleepPercentages = () => {
    if (!sleepData) return [];

    return sleepData.map(entry => {
      const lightSleepDuration = entry.lightSleepCycles.reduce((acc, cycle) => acc + (cycle.end.seconds - cycle.start.seconds), 0);
      const remDuration = entry.remPeriods.reduce((acc, period) => acc + (period.end.seconds - period.start.seconds), 0);
      // console.log(lightSleepDuration);
      const lightSleepPercentage = (lightSleepDuration / entry.totalDuration) * 100;
      const remPercentage = (remDuration / entry.totalDuration) * 100;
      const remainPercentage = 100 - lightSleepPercentage - remPercentage;
      // console.log(lightSleepPercentage);

      setRemPercentage(remPercentage);
      setLightSleepPercentage(lightSleepPercentage);
      setRemainPercentage(remainPercentage);
      // return {
      //   ...entry,
      //   lightSleepPercentage,
      //   remPercentage
      // };
    });
  };
  // console.log(lightSleepPercentage)

  useEffect(() => {
    if (sleepData) {
      calculateSleepPercentages();
    }
  }, [sleepData]);


  const pieData = [
    {
      value: remPercentage,
      color: '#009FFF',
      gradientCenterColor: '#006DFF',
      focused: true,
    },
    { value: lightSleepPercentage, color: '#6a53a4', gradientCenterColor: '#6a53a4' },
    { value: remainPercentage, color: '#fffbff', gradientCenterColor: '#fffbff' },
  ];

  // console.log(lightSleepPercentage);

  const chartConfig = {
    backgroundGradientFrom: 'rgba(26, 255, 146, 0)',
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: 'rgba(26, 255, 146, 0)',
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(133, 92, 172, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
  };

  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;

  const renderDot = color => {
    return (
      <View
        style={{
          height: 10,
          width: 10,
          borderRadius: 5,
          backgroundColor: color,
          marginRight: 10,
        }}
      />
    );
  };

  const renderLegendComponent = () => {
    return (
      <>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 10,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: 120,
              marginRight: 20,
            }}>
            {renderDot('#006DFF')}
            <Text style={{ color: '#663399' }}>Rem Sleep: {remPercentage.toFixed(1)}%</Text>
          </View>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', width: 120 }}>
            {renderDot('#8F80F3')}
            <Text style={{ color: '#663399' }}>Light Sleep: {lightSleepPercentage.toFixed(1)}%</Text>
          </View>
        </View>
      </>
    );
  };


  // console.log(entry.lightSleepPercentage);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {sleepData && sleepData.map((entry, index) => (
          <View key={index}>
            <View>
              <Card
                style={styles.card}
                onPress={() => { }}>
                {/* action of pressing the profile card */}
                <Card.Title
                  // title={<Text style={{ color: '#663399', fontSize: 56, fontWeight: 'bold', marginLeft: 16 }}>{new Date(entry.sleepStart.seconds * 1000).toLocaleDateString()}</Text>}
                  // subtitle={}
                  titleStyle={styles.cardTitle}
                  subtitleStyle={styles.cardSubtitle}
                  // left={(props) => <Avatar.Image {...props} size={60} source={require('../images/logo.png')} />}
                  leftStyle={styles.avatar}
                  style={styles.cardContent}
                />
                <Card.Content>
                  <View
                    style={{
                      // paddingVertical: 100,
                      backgroundColor: 'transparent',
                      flex: 1,
                    }}>
                    <View
                      style={{
                        // margin: 20,
                        // padding: 16,
                      }}>
                      <Text style={{ color: '#663399', fontSize: 26, fontWeight: 'bold', marginTop: -30, marginLeft: 15, marginBottom: 20 }}>
                        Sleep Report
                      </Text>
                      <Text style={{ color: '#663399', fontSize: 16, fontWeight: 'bold', marginLeft: 16 }} >Sleep Start:</Text>
                      <Text style={styles.timedata} >{new Date(entry.sleepStart.seconds * 1000).toLocaleTimeString()}</Text>
                      <Text style={{ color: '#663399', fontSize: 16, fontWeight: 'bold', marginLeft: 16 }}>Sleep End:</Text>
                      <Text style={styles.timedata} >{new Date(entry.sleepEnd.seconds * 1000).toLocaleTimeString()}</Text>
                      <Text style={{ color: '#663399', fontSize: 16, fontWeight: 'bold', marginLeft: 16 }}>Total Duration: </Text>
                      <Text style={styles.timedata}> {formatDuration(entry.totalDuration)} </Text>
                      {entry.wakeTimes.length > 0 && (
                        <>
                          <Text style={{ color: '#663399', fontSize: 16, fontWeight: 'bold', marginLeft: 16 }}>Wake Times:</Text>
                          {entry.wakeTimes.map((wakeTime, idx) => (
                            <Text key={idx} style={styles.timedata}>
                              {new Date(wakeTime.seconds * 1000).toLocaleTimeString()}
                            </Text>
                          ))}
                        </>
                      )}

                      <View style={{ padding: 20, alignItems: 'center' }}>
                        <PieChart
                          data={pieData}
                          donut
                          showGradient
                          sectionAutoFocus
                          radius={90}
                          innerRadius={60}
                          innerCircleColor={'#232B5D'}
                          centerLabelComponent={() => {
                            return (
                              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Text
                                  style={{ fontSize: 22, color: 'white', fontWeight: 'bold' }}>
                                  {remPercentage.toFixed(2)}%
                                </Text>
                                <Text style={{ fontSize: 14, color: 'white' }}>Rem Sleep</Text>
                              </View>
                            );
                          }}
                        />
                      </View>
                      {renderLegendComponent()}
                    </View>
                  </View>

                  {/* {entry.lightSleepCycles.length > 0 && (
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
                  )} */}
                  {/* The title and paragraph have been removed as the Card.Title already contains the name and email */}
                </Card.Content>
                <Card.Actions>
                  {/* Actions can be added here if needed */}
                </Card.Actions>
              </Card>
            </View>


          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
      <Button icon="calendar" mode="contained" onPress={(showDatepicker)}>
      {formattedDate}
        </Button>
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
    height: '100%',
    
  },
  card: {
    marginHorizontal: 20,
    marginTop: 40,
    // padding: 20,
    // backgroundColor: '#fff',
    // borderRadius: 20,
    borderRadius: 20,
    backgroundColor: '#f0dbfe',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3.84,
    // alignItems: 'flex-end', // Horizontally align the content to the end
    // elevation: 5,
    // alignItems: 'center', // Centers all child components horizontally
  },
  footer: {
    padding: 20,
    // borderTopWidth: 1,
    // borderColor: '#e0e0e0',
    // backgroundColor: '#ffffff',
    alignItems: 'center', // Center the button horizontally
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    alignItems: 'left',
    marginLeft: -70,
  },
  timedata: {
   color: '#2d0050', 
   fontSize: 30, 
   fontWeight: 'bold', 
   marginLeft: "35%"
  }
});
