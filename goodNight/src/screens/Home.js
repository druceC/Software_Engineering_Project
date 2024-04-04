import React, {useState} from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity} from 'react-native';

function MenuOptions({item, pressHandler}){
    return (
        <TouchableOpacity onPress={() => pressHandler(item.navigate)}>
            <Text style={styles.item}>{item.text}</Text>
        </TouchableOpacity>
    );
}

// Screen detailer for Home Screen
// Contains the navigation menus for three different functionalities of the app

export const HomeScreen = ({navigation}) => {
    const [menuOptions, setMenus] = useState([
      {text: "CBT-i Therapy Session", key: "1", navigate: "therapySessionMenu"},
      {text: "Locate Nearby Therapist", key: "2", navigate: "locateTherapistMenu"},
      {text: "Sleep Track", key: "3", navigate: "sleepTrackMenu"},
      {text: "test login", key: "4", navigate: "testLogin"},
      {text: "test Registration", key: "5", navigate: "testRegis",}
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


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 40,
    },
    list: {
        marginTop:20,
    },
    item: {
        padding: 16,
        marginTop: 16, 
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 20,
    }
})


