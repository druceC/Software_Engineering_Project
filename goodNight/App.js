import { StatusBar } from 'expo-status-bar';
import React, {useState} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Header from './components/header';
import MenuOptions from './components/menuOptions';

// Screen detailer for Home Screen
// Contains the navigation menus for three different functionalities of the app
function HomeScreen({navigation}){
  const [menuOptions, setMenus] = useState([
    {text: "CBT-i Therapy Session", key: "1", navigate: "therapySessionMenu"},
    {text: "Locate Nearby Therapist", key: "2", navigate: "locateTherapistMenu"},
    {text: "Sleep Track", key: "3", navigate: "sleepTrackMenu"},
  ]);
  
  // By pressing the menu, user navigates to the corresponding screen
  const pressHandler = (key) =>{
    navigation.navigate(key)
  }
  return(

    // Component for Home Screen: lists different menus
    <View style={styles.container}>
      <View style={styles.list}>
        <FlatList
          data={menuOptions}
          renderItem={({item}) => (
            <MenuOptions item={(item)} pressHandler={pressHandler}/>
          )}
        />
      </View>
    </View>
  )
}

// Screen Function for Therapy Menu -> Build on here for the Questionnaire (Druce)
function TherapySessionMenu(){
  return(
    <View style={styles.container}>
      <View style={styles.menuOption}>
        <Text>Hello World</Text>
      </View>
    </View>
  )
}

// Screen Function for Locate Therapist -> Build on here for the locate nearby therapist (Jun)
function LocateTherapistMenu(){
  return(
    <View style={styles.container}>
        <View style={styles.menuOption}>
          <Text>Locate Nearby Therapist</Text>
        </View>
    </View>
  )
}

// Screen Function for Sleep Track -> Build on here for the Sleep Track (Yumi)
function SleepTrackMenu(){
  return(
    <View style={styles.container}>
        <View style={styles.menuOption}>
          <Text>Sleep Track</Text>
        </View>
    </View>
  )
}

const Stack = createNativeStackNavigator();


// Function for Whats going to be shown on screen
export default function App() {
  
// List of different Screens for the app
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Good Night!" component={HomeScreen} />
        <Stack.Screen name="therapySessionMenu" component={TherapySessionMenu} />
        <Stack.Screen name="locateTherapistMenu" component={LocateTherapistMenu} />
        <Stack.Screen name="sleepTrackMenu" component={SleepTrackMenu} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Stylesheet for the app -> (Andy)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 40,
  },
  list: {
    marginTop:20,
  },
  menuOption:{ 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center' 
  }
});
