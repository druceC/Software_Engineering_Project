import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

// Screen Function for Sleep Track -> Build on here for the Sleep Track (Yumi)

export const SleepTrackMenu = () =>{
    return(
      <View style={styles.container}>
          <View style={styles.menuOption}>
            <Text>Sleep Track</Text>
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