import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, ActivityIndicator, StyleSheet } from 'react-native';
import { VictoryScatter, VictoryChart, VictoryAxis, VictoryTheme } from 'victory-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const processChartData = (entry) => {
    console.log(VictoryTheme);
    const sleepStart = entry.sleepStart ? new Date(entry.sleepStart.seconds * 1000) : null;
    const sleepEnd = entry.sleepEnd ? new Date(entry.sleepEnd.seconds * 1000) : null;
    const totalDuration = sleepStart && sleepEnd ? (sleepEnd - sleepStart) / 1000 / 60 : 0; // duration in minutes

    const states = [
        { state: 'Awake', value: 1, count: entry.wakeTimes.length },
        { state: 'Light Sleep', value: 2, count: entry.lightSleepCycles.length },
        { state: 'Deep Sleep', value: 3, count: entry.remPeriods.length }
    ];

    return states.map(state => ({
        x: totalDuration,
        y: state.value,
        label: `${state.state} (${state.count})`
    }));
};

export const ReportScreen = () => {
    const [sleepData, setSleepData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      // Assuming user is logged in and exists
      const user = auth().currentUser;
      if (user) {
          const unsubscribe = firestore()
              .collection('sleepData')
              .where('uid', '==', user.uid)
              .orderBy('createdAt', 'desc')
              .onSnapshot(querySnapshot => {
                  const data = [];
                  querySnapshot.forEach(doc => {
                      const docData = doc.data();
                      docData.lightSleepCycles = docData.lightSleepCycles || [];
                      docData.remPeriods = docData.remPeriods || [];
                      docData.wakeTimes = docData.wakeTimes || [];
                      data.push(docData);
                  });
                  setSleepData(data);
                  setLoading(false);
              }, error => {
                  console.error("Failed to fetch sleep data:", error);
                  setLoading(false);
              });
  
          return () => unsubscribe();
      }
  }, []);

    return (
      <ScrollView style={styles.container}>
      {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
      ) : sleepData.length > 0 ? (
          sleepData.map((entry, index) => (
              <View key={index} style={styles.chartContainer}>
                  <Text style={styles.headerText}>
                      Sleep Data from {new Date(entry.createdAt.seconds * 1000).toLocaleDateString()}
                  </Text>
                    <VictoryChart
                        width={Dimensions.get('window').width - 20}
                        height={300}
                        theme={VictoryTheme.material}
                        domainPadding={{ x: 50, y: [0, 20] }}
                    >
                        <VictoryAxis
                            label="Total Duration (minutes)"
                            style={{
                                axisLabel: { padding: 30 }
                            }}
                        />
                        <VictoryAxis
                            dependentAxis
                            label="Sleep State"
                            tickValues={[1, 2, 3]}
                            tickFormat={["Awake", "Light Sleep", "Deep Sleep"]}
                            style={{
                                axisLabel: { padding: 40 }
                            }}
                        />
                        <VictoryScatter
                            data={processChartData(entry)}
                            size={5}
                            style={{ data: { fill: "#c43a31" } }}
                            labels={({ datum }) => datum.label}
                        />
                    </VictoryChart>
                    </View>
            ))
        ) : (
            <Text>No sleep data available</Text>
        )}
    </ScrollView>
    );
  };

  const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    chartContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});