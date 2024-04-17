import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, BottomNavigation } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TestScreen } from './TestingScreen';
import { HomeScreen } from './HomeScreen';
import { SettingsScreen } from './SettingsScreen';
import { Login } from './Login'
import { SleepTrackMenu } from './SleepTrack';
import { LocateTherapistMenu } from './LocateNearbyTherapist';


const Tab = createBottomTabNavigator();

export const LandingPage = () => {

  return (
    <Tab.Navigator
      //initialize the Tab Navigator
      screenOptions={{
        headerShown: false, //Hide the header in the page
      }}

      //Tab Bar for the Bottom Navigation 

      //NO NEED TO TOUCH THIS
      tabBar={({ navigation, state, descriptors, insets }) => (
        <BottomNavigation.Bar
          navigationState={state}
          safeAreaInsets={insets}
          onTabPress={({ route, preventDefault }) => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (event.defaultPrevented) {
              preventDefault();
            } else {
              navigation.dispatch({
                ...CommonActions.navigate(route.name, route.params),
                target: state.key,
              });
            }
          }}

          renderIcon={({ route, focused, color }) => {
            const { options } = descriptors[route.key];
            if (options.tabBarIcon) {
              return options.tabBarIcon({ focused, color, size: 24 });
            }

            return null;
          }}
          getLabelText={({ route }) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                  ? options.title
                  : route.title;

            return label;
          }}
        />
      )}
    >

      <Tab.Screen
        // SleepTrackMenu Screen Tab Content
        name="SleepTrackMenu"
        component={SleepTrackMenu}
        options={{
          tabBarLabel: 'Sleep Track',
          tabBarIcon: ({ color, size }) => {
            return <Icon name="power-sleep" size={size} color={color} />;
          },
        }}
      />


      <Tab.Screen
        // LocateTherapist Screen Tab Content
        name="LocateTherapist"
        component={LocateTherapistMenu}
        options={{
          tabBarLabel: 'Find Therapist',// Tab Name
          tabBarIcon: ({ color, size }) => {
            return <Icon name="account-child" size={size} color={color} />;// Tab icon
          },
        }}
      />


      <Tab.Screen
        // Testing Screen Tab Content
        name="Testing"
        component={TestScreen}
        options={{
          tabBarLabel: 'Testing',// Tab Name
          tabBarIcon: ({ color, size }) => {
            return <Icon name="test-tube" size={size} color={color} />;// Tab icon
          },
        }}
      />

      <Tab.Screen
        // Testing Screen Tab Content
        name="My Profile"
        component={Login}
        options={{
          tabBarLabel: 'My Profile',// Tab Name
          tabBarIcon: ({ color, size }) => {
            return <Icon name="account-circle" size={size} color={color} />;// Tab icon
          },
        }}
      />


    </Tab.Navigator>
  )
}


const styles = require('../../style');