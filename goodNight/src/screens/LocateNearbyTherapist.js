import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

// Screen Function for Locate Therapist -> Build on here for the locate nearby therapist (Jun)

export const LocateTherapistMenu = () =>{
    return(
      <View style={styles.container}>
          <View style={styles.menuOption}>
            <Text>Locate Nearby Therapist</Text>
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