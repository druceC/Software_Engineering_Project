import React from 'react';
import {StyleSheet, View} from 'react-native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, BottomNavigation } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TestScreen } from './TestingScreen';



export const HomeScreen = () =>{
    return (
      <View style={styles.container}>
        <Text variant="headlineMedium">HomeScreen!</Text>
      </View>
    );
  }


  const styles = require('../../style');