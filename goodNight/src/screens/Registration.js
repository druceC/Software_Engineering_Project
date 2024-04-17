import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Keyboard, Pressable, TouchableOpacity, Alert, Image, TouchableHighlight  } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import auth from '@react-native-firebase/auth';
import db from "@react-native-firebase/database";
import { Icon, TextInput } from 'react-native-paper';
import { Button } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';

export const Register = () => {
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(true);

    const nav = useNavigation();

    const createProfile = async (response) => {
        db().ref(`/users/${response.user.uid}`).set({ name });
    };

    const registerImmediately = async () => {
        if (email && password) {
            try {
                const response = await auth().signInWithEmailAndPassword(email, password);

                if (response.user) {
                    await createProfile(response);
                    nav.replace("Home");
                }
            }
            catch (error) {
                Alert.alert('Error', error.message);
            }
        }
    }

    const handleEyeIconPress = () => {
        // Toggle the state for password visibility
        setIsPasswordVisible(!isPasswordVisible);
    };

    return (
        <Pressable onPress={Keyboard.dismiss}>
            <SafeAreaView>
                <View style={styles.loginHeader}>
                    <Image
                        source={require('../images/logo.png')} // The source of the logo image stored locally.
                        style={styles.loginLogo}
                        borderRadius={25} // Sets the border radius of the image for rounded corners.
                    />
                    <Text style={styles.headerTitle}>Have a GoodNight!</Text>
                </View>
                <View style={styles.loginInputBox}>
                    <TextInput
                        style={styles.loginTextInput}
                        mode='outlined' // Outlined style for the text input.
                        label='Username' // Placeholder text shown when the input is empty.
                        value={name} // Controlled value of the input.
                        onChangeText={setName} // Function to update the state when the input changes.
                    />
                    <TextInput
                        style={styles.loginTextInput}
                        mode='outlined' // Outlined style for the text input.
                        label='Email' // Placeholder text shown when the input is empty.
                        value={email} // Controlled value of the input.
                        onChangeText={setEmail} // Function to update the state when the input changes.
                    />
                    <TextInput
                        style={styles.loginTextInput}
                        mode='outlined'
                        label='Set Password'
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={isPasswordVisible} // Boolean that toggles the visibility of the password.
                        right={ // Icon inside the TextInput that toggles the password visibility.
                            <TextInput.Icon
                                icon={isPasswordVisible ? "eye" : "eye-off"} // Conditional icon based on the visibility state.
                                onPress={handleEyeIconPress} // Function to toggle the visibility state.
                            />
                        }
                    />
                    <TextInput
                        style={styles.loginTextInput}
                        mode='outlined'
                        label='Confirm Password'
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={true} // Boolean that toggles the visibility of the password.
                    />
                </View>
                
                <View style={styles.registerButton}>
                    <PaperButton
                        style={styles.loginButton}
                        contentStyle={styles.loginButtonContent} // Specific style for the content inside the button.
                        icon="arrow-right-thick" // Icon indicating a forward action, suitable for a login button.
                        mode="contained" // Fully colored button style.
                        onPress={registerImmediately} // Function called when the button is pressed.
                        borderRadius={25} // Rounded corners for the button.
                        compact={true} // Reduces the padding for a compact look.
                        > 
                        Register
                    </PaperButton>
                </View>
            </SafeAreaView>
        </Pressable>
    )
}

const styles = require('../../style');