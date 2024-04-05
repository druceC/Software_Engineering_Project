import React, {useState} from 'react';
import { StyleSheet, Text, View, TextInput, SafeAreaView, Keyboard, Pressable, TouchableOpacity, Alert} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import auth from '@react-native-firebase/auth';
import db from "@react-native-firebase/database";

const Button = ({onPress, title}) =>{
    return(
        <TouchableOpacity onPress={onPress}>
            <Text>{title}</Text>
        </TouchableOpacity> 
    );
};

export const Register= () =>{
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const nav = useNavigation();

    const createProfile = async (response) =>{
        db().ref(`/users/${response.user.uid}`).set({name});
    };

    const registerImmediately = async () =>{
        if(email && password){
            try{
                const response = await auth().signInWithEmailAndPassword(email, password);

                if (response.user) {
                    await createProfile(response);
                    nav.replace("Home");
                }
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
                        placeholder='Name'
                        value={name}
                        onChangeText={setName}
                    />
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
                <Button onPress={registerImmediately} title="Register"/>
            </SafeAreaView>
        </Pressable>
    )
}