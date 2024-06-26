import React, { useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, ScrollViewComponent, ScrollView } from 'react-native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { Text, BottomNavigation, Appbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

function MenuOptions({ item, pressHandler }) {
  return (
    <TouchableOpacity onPress={() => pressHandler(item.navigate)}>
      <Text style={styles.item}>{item.text}</Text>
    </TouchableOpacity>
  );
}

// Screen detailer for Home Screen
// Contains the navigation menus for three different functionalities of the app

export const TestScreen = ({ navigation }) => {
  const [menuOptions, setMenus] = useState([
    { text: "CBT-i Therapy Session", key: "1", navigate: "therapySessionMenu" },
    { text: "Locate Nearby Therapist", key: "2", navigate: "locateTherapistMenu" },
    { text: "Sleep Track", key: "3", navigate: "sleepTrackMenu" },
    { text: "test login", key: "4", navigate: "LoginScreen" },
    { text: "test Registration", key: "5", navigate: "RegistScreen", },
    { text: "blank Page", key: "6", navigate: "blankPage", },
  ]);

  // By pressing the menu, user navigates to the corresponding screen
  const pressHandler = (key) => {
    navigation.navigate(key)
  }
  return (
    // Component for Home Screen: lists different menus
    <View>

      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Testing Entries" />
      </Appbar.Header>
      <View>
        <View style={styles.list}>
          <FlatList
            data={menuOptions}
            renderItem={({ item }) => (
              <MenuOptions item={(item)} pressHandler={pressHandler} />
            )}
          />
        </View>
      </View>
    </View>

  )
}

const styles = require('../../style');


