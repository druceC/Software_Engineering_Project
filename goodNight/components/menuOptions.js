import React from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';

export default function MenuOptions({item, pressHandler}){
    return (
        <TouchableOpacity onPress={() => pressHandler(item.text)}>
            <Text style={styles.item}>{item.text}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    item: {
        padding: 16,
        marginTop: 16, 
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 20,
    }
})