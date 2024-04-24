import React, { useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TherapySessionMenu } from './src/screens/TherapySessionMenu';
import { LocateTherapistMenu } from './src/screens/LocateNearbyTherapist';
import { SleepTrackMenu } from './src/screens/SleepTrack';
import { HomeScreen } from './src/screens/TestingScreen';
import { Login } from './src/screens/Login';
import { Register } from './src/screens/Registration';
import { LandingPage } from './src/screens/LandingPage';
import { BlankPage } from './src/screens/BlankPage';
import { Text, BottomNavigation } from 'react-native-paper';
import { ProfilePage } from './src/screens/ProfilePage';
import { TestScreen } from './src/screens/TestingScreen';

const Stack = createNativeStackNavigator();

// Function for Whats going to be shown on screen
export default function App() {


  // List of different Screens for the app
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home Page"
        screenOptions={{
          headerMode: 'screen',
          headerShown: false,
        }}
      >

        <Stack.Screen
          name="LandingPage"
          component={LandingPage}
          screenOptions={{
            headerShown: false,
          }}
        // Andy: Here I changed screen reference to the "LandingPage" in the screens/LandingPage.js
        />

        <Stack.Screen name="therapySessionMenu" component={TherapySessionMenu} />
        <Stack.Screen name="locateTherapistMenu" component={LocateTherapistMenu} />
        <Stack.Screen name="sleepTrackMenu" component={SleepTrackMenu} />
        <Stack.Screen name="LoginScreen" component={Login} />
        <Stack.Screen name="RegistScreen" component={Register} />
        <Stack.Screen name="blankPage" component={BlankPage} />
        <Stack.Screen name="ProfilePage" component={ProfilePage} />
        <Stack.Screen name="TestScreen" component={TestScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Stylesheet for the app -> (Andy)
const styles = require('./style');
