import { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

export const ReportScreen = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
      fetchData().then(fetchedData => setData(fetchedData));
  }, []);

  const chartData = {
      labels: data.map(d => new Date(d.createdAt.seconds * 1000).toLocaleDateString()), // Adjust according to your data structure
      datasets: [
          {
              data: data.map(d => d.totalDuration), // Example, map your actual sleep stage values
              color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
              strokeWidth: 2 // optional
          }
      ],
      legend: ["Sleep Duration"] // optional
  };

  const fetchData = async () => {
    const user = auth().currentUser;
    const uid = user ? user.uid : null;
    const data = [];

    if (uid) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const querySnapshot = await firestore()
            .collection('sleepData')
            .where('uid', '==', uid)
            .where('createdAt', '>=', startOfDay)
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();

        querySnapshot.forEach((doc) => {
            data.push(doc.data());
        });
    }
    return data;
  };

  return (
      <LineChart
          data={chartData}
          width={Dimensions.get('window').width} // from react-native
          height={220}
          chartConfig={{
              backgroundColor: '#e26a00',
              backgroundGradientFrom: '#fb8c00',
              backgroundGradientTo: '#ffa726',
              decimalPlaces: 2, // optional, defaults to 2dp
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                  borderRadius: 16
              },
              propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#ffa726'
              }
          }}
          bezier
          style={{
              marginVertical: 8,
              borderRadius: 16
          }}
      />
  );
};
