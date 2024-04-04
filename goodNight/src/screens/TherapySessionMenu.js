import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

// Screen Function for Therapy Menu -> Build on here for the Questionnaire (Druce)

export const TherapySessionMenu = () =>{
    return(
      <View style={styles.container}>
        <View style={styles.menuOption}>
          <Text>Hello World</Text>
        </View>
      </View>
    )
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      padding: 40,
    },
    menuOption:{ 
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center' 
    }
  });