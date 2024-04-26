import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Keyboard, Pressable, TouchableOpacity, Alert, Image, TouchableHighlight } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import auth from '@react-native-firebase/auth';
import { Icon, TextInput } from 'react-native-paper';
import { Button } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { Register } from './Registration';

export const Login = () => {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(true);

    const nav = useNavigation();

    const register = () => {
        nav.navigate("RegistScreen");
    }

    const loginSuccess = async () => {
        if (email && password) {
            try {
                const response = await auth().signInWithEmailAndPassword(email, password);

                if (response.user) nav.replace("LandingPage");
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
                    <Text style={styles.headerTitle}>Have a GoodNight 🌃</Text>
                </View>
                <View style={styles.loginInputBox}>
                    <TextInput
                        style={styles.loginTextInput}
                        mode='outlined' // Outlined style for the text input.
                        label='Email' // Placeholder text shown when the input is empty.
                        value={email} // Controlled value of the input.
                        onChangeText={setEmail} // Function to update the state when the input changes.
                        inputMode='email' // Specifies that this input is for email addresses.
                    />
                    <TextInput
                        style={styles.loginTextInput}
                        mode='outlined'
                        label='Password'
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
                </View>
                <PaperButton
                    style={styles.registerButton}
                    mode="contained-tonal"
                    icon="pencil" // Icon representing a pencil, commonly used for editing or registering.
                    onPress={register} // Function called when the button is pressed.
                    compact={true}  // Reduces the padding inside the button for a more compact look.
                    >
                    Register
                </PaperButton>

                <PaperButton
                    style={styles.loginButton}
                    contentStyle={styles.loginButtonContent} // Specific style for the content inside the button.
                    icon="arrow-right-thick" // Icon indicating a forward action, suitable for a login button.
                    mode="contained" // Fully colored button style.
                    onPress={loginSuccess} // Function called when the button is pressed.
                    borderRadius={25} // Rounded corners for the button.
                    compact={true} // Reduces the padding for a compact look.
                    > 
                    Login
                </PaperButton>
            </SafeAreaView>
        </Pressable>
    )
}

const styles = require('../../style');