import React, { useState, useEffect, useRef } from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity, Button, TextInput, ScrollView,CheckBox, Animated } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Welcome from "./Welcome";
import sleepEvaluationPage from "./EvaluationPage";
import Result from "./Result";
import firestore from '@react-native-firebase/firestore';
import { Audio } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

const Stack = createNativeStackNavigator();
export default function CBTIQ() {
  return (
    // Container to manage navigation between screens
    <NavigationContainer independent={true}>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen
          name="Welcome"
          component={Welcome}
          options={{ headerShown: false }}
        />
        {/* Screen for the sleep evaluation form */}
        <Stack.Screen
          name="Quiz"
          component={sleepEvaluationPage}
          options={{
            title: "Sleep Index",
            headerStyle: {
              backgroundColor: "#535A67",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        />
        {/* Screen for displaying the result */}
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
