import { StatusBar } from 'expo-status-bar';
import React, {useState} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import Header from './components/header';
import MenuOptions from './components/menuOptions';

export default function App() {
  const [menuOptions, setMenus] = useState([
    {text: "CBT-i Therapy Session", key: "1"},
    {text: "Locate Nearby Therapist", key: "2"},
    {text: "Sleep Track", key: "3"},
  ]);

  const pressHandler = (text) =>{
    //Should load to each page corresponding to menu options
    //For now, just console log the menu text
    console.log(text);
  }

  return (
    <View style={styles.container}>
      {/* header */}
      <Header />
      <View style={styles.content}>
        {/* to form*/}

        <View style={styles.list}>
          <FlatList
            data={menuOptions}
            renderItem={({item}) => (
              <MenuOptions item={(item)} pressHandler={pressHandler}/>
            )}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    //justifyContent: 'center',
  },
  content: {
    padding: 40,
  },
  list: {
    marginTop:20,
  }
});
