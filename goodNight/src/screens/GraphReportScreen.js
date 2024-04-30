import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';



export const GraphReportScreen = () => {
    const nav = useNavigation();
    const chartConfig = {
        backgroundGradientFrom: '#fff',
        backgroundGradientFromOpacity: 0,
        backgroundGradientTo: '#fff',
        backgroundGradientToOpacity: 0.5,
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.5,
    };

    const sleepStageData1 = {
        labels: ['10pm', '11pm', '12am', '1am', '2am', '3am', '4am', '5am', '6am'],
        datasets: [
            {
                data: [0, 2, 1, 0.5, 0.8, 2, 1.2, 2, 0],
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                strokeWidth: 2,
            },
        ],
    };

    const sleepStageData2 = {
        labels: ['10pm', '11pm', '12am', '1am', '2am', '3am', '4am', '5am', '6am'],
        datasets: [
            {
                data: [0, 1.2, 0.4, 1.7, 1, 2, 1.5, 2, 0],
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                strokeWidth: 2,
            },
        ],
    };

    const sleepStageData3 = {
        labels: ['10pm', '11pm', '12am', '1am', '2am', '3am', '4am', '5am', '6am'],
        datasets: [
            {
                data: [0, 1.3, 0, 1.9, 1.1, 0.2, 1.3, 1.9, 0],
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                strokeWidth: 2,
            },
        ],
    };

    const sleepStageData4 = {
        labels: ['10pm', '11pm', '12am', '1am', '2am', '3am', '4am', '5am', '6am'],
        datasets: [
            {
                data: [0, 1, 0.49846, 1.479, 1.98, 0.78, 1.46, 1.12, 0],
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                strokeWidth: 2,
            },
        ],
    };

    const sleepStageData5 = {
        labels: ['10pm', '11pm', '12am', '1am', '2am', '3am', '4am', '5am', '6am'],
        datasets: [
            {
                data: [0, 1.2, 0.4914, 0.67, 1.98, 2, 1.34, 2, 0],
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                strokeWidth: 2,
            },
        ],
    };
    const [isLoading, setLoading] = useState(true);

    // Simulate data fetching or other async processes
    useEffect(() => {
        setTimeout(() => {
            setLoading(false); // Set loading to false after data is 'loaded'
        }, 1000); // Simulate a network request or computation delay
    }, []);

    if (isLoading) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color="#663399" />
                <Text>Generating Your Report 📊</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => nav.navigate("LandingPage")} />
                <Appbar.Content title="Graphs & Reports" />
            </Appbar.Header>
            <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
                <View style={styles.container}>
                    <View style={styles.chartContainer}>
                        <LineChart
                            data={sleepStageData1}
                            width={350}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                        />
                    </View>
                    <View style={styles.chartContainer}>
                        <LineChart
                            data={sleepStageData2}
                            width={350}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                        />
                    </View>
                    <View style={styles.chartContainer}>
                        <LineChart
                            data={sleepStageData3}
                            width={350}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                        />
                    </View>
                    <View style={styles.chartContainer}>
                        <LineChart
                            data={sleepStageData4}
                            width={350}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                        />
                    </View>
                    <View style={styles.chartContainer}>
                        <LineChart
                            data={sleepStageData5}
                            width={350}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

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
