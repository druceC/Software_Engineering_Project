import React, {useState} from 'react';
import { StyleSheet, Text, View, TextInput, SafeAreaView, Keyboard, Pressable, TouchableOpacity, Alert} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import auth from '@react-native-firebase/auth';

const Button = ({onPress, title}) =>{
    return(
        <TouchableOpacity onPress={onPress}>
            <Text>{title}</Text>
        </TouchableOpacity> 
    );
};

export const Login= () =>{
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

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

    return(
        <Pressable onPress={Keyboard.dismiss}>
            <SafeAreaView>
                <View>
                    <TextInput
                        placeholder='Email'
                        value={email}
                        onChangeText={setEmail}
                        inputMode='email'
                    />
                    <TextInput
                        placeholder='Password'
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>
                <Button onPress={loginSuccess} title="Login"/>
                <Button onPress={register} title="Register"/>
            </SafeAreaView>
        </Pressable>
    )
}

