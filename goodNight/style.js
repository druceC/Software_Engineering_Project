'use strict';
import { StyleSheet, Text, View, Dimensions } from 'react-native';

const windowWidth = Dimensions.get('window').width; // Get the width of the device window

module.exports = StyleSheet.create({
    menuOption: {
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
        marginTop: 20,
    },
    item: {
        padding: 16,
        marginTop: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 20,
    },
    loginLogo: {
        marginTop: '10%',
        width: '30%',
        height: windowWidth * 0.3,
    },
    loginHeader: {
        marginTop: '15%',
        // flex: 1,
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
    },
    loginInputBox: {
        marginTop: '5%',
        left: '7.5%',
        width: '85%',
    },
    loginTextInput: {
        marginTop: '1%',
    },
    loginButton: {
        marginTop: '1%',
        width: '90%',
        left: '5%',
    },
    registerButton: {
        marginTop: '10%',
        width: '90%',
        left: '5%',
        textDecorationLine: 'underline',
    },
    headerTitle: {
        marginTop: '5%',
        fontSize: 30, 
        fontFamily: 'Urbanist',
    },
});
