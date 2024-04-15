'use strict';
import {StyleSheet, Text, View} from 'react-native';

module.exports = StyleSheet.create({
    menuOption:{ 
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
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
});
