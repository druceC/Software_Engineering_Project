import React, {useState} from 'react';
import { StyleSheet, Text, View, SafeAreaView, Keyboard, Pressable, TouchableOpacity, Alert, Image, TouchableHighlight} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import auth from '@react-native-firebase/auth';
import { Icon, TextInput } from 'react-native-paper';
import { Button } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';




export const Login= () =>{
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(true);

    const nav = useNavigation();
    
    const register = () =>{
        nav.push("Register");
    }
    
    const loginSuccess = async () =>{
        if(email && password){
            try{
                const response = await auth().signInWithEmailAndPassword(email, password);

                if (response.user) nav.replace("Home");
            }
            catch(error){
                Alert.alert('Error', error.message);
            }
        }
    }

    const handleIconPress = () => {
        // Toggle the state for password visibility
        setIsPasswordVisible(!isPasswordVisible);
    };

    return(
        <Pressable onPress={Keyboard.dismiss}>
            <SafeAreaView>
                <View style={styles.loginHeader}>
                    <Image
                        source={require('../images/ghost.png')} // Local image
                        style={styles.loginLogo}
                        borderRadius={25}
                    />
                </View>
                <View style={styles.loginInputBox}>
                    <TextInput
                        style={styles.loginTextInput}
                        mode = 'outlined'
                        label='Email'
                        value={email}
                        onChangeText={setEmail}
                        inputMode='email'
                    />
                    <TextInput
                        style={styles.loginTextInput}
                        mode = 'outlined'
                        label='Password'
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={isPasswordVisible} // Use state to control visibility
                        right={
                            <TextInput.Icon
                                icon={isPasswordVisible ? "eye" : "eye-off"}
                                onPress={handleIconPress}
                            />
                        }
                    />
                </View>
                    <PaperButton
                        style={styles.registerButton}
                        mode="contained-tonal" 
                        icon="pencil"
                        onPress={register}
                        compact={true}>
                        Register
                    </PaperButton>

                    <PaperButton
                        style={styles.loginButton}
                        contentStyle={styles.loginButtonContent}
                        icon="arrow-right-thick"
                        mode="contained"
                        onPress={loginSuccess}
                        borderRadius={25}
                        compact={true}>
                            Login
                    </PaperButton>
            </SafeAreaView>
        </Pressable>
    )
}

const styles = require('../../style');

export default Login;