import React, {useState} from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TherapySessionMenu } from './src/screens/TherapySessionMenu';
import { LocateTherapistMenu } from './src/screens/LocateNearbyTherapist';
import { SleepTrackMenu } from './src/screens/SleepTrack';
import { HomeScreen} from './src/screens/Home';
import { Login } from './src/screens/Login';
import { Register } from './src/screens/Registration';
import { MainPage } from './src/screens/Main';
import { Text, BottomNavigation } from 'react-native-paper';

const Stack = createNativeStackNavigator();

// Function for Whats going to be shown on screen
export default function App() {
  
// List of different Screens for the app
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Good Night Andy New Version 😈" component={MainPage} />
        <Stack.Screen name="therapySessionMenu" component={TherapySessionMenu} />
        <Stack.Screen name="locateTherapistMenu" component={LocateTherapistMenu} />
        <Stack.Screen name="sleepTrackMenu" component={SleepTrackMenu} />
        <Stack.Screen name="testLogin" component={Login} />
        <Stack.Screen name="testRegis" component={Register} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Stylesheet for the app -> (Andy)
const styles = require('./style');
