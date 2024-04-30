import React, { useState, useEffect, useRef } from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity, Button, TextInput, ScrollView,CheckBox, Animated } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Welcome from "./Welcome";
import QuizPage from "./QuizPage";
import Result from "./Result";
import firestore from '@react-native-firebase/firestore';
import { Audio } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
// import firebase from 'firebase';

const Stack = createNativeStackNavigator();
export default function CBTIQ() {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen
          name="Welcome"
          component={Welcome}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Quiz"
          component={QuizPage}
          options={{
            title: "Questions",
            headerStyle: {
              backgroundColor: "#fac782",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        />
        <Stack.Screen
          name="Result"
          component={Result}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
