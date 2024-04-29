import React, { useState, useEffect, useRef } from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity, Button, TextInput, ScrollView,CheckBox, Animated } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Welcome from "./app/screens/Welcome";
import QuizPage from "./app/screens/Questions";
// import firestore from '@react-native-firebase/firestore';
import { Audio } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
// import firebase from 'firebase';
// import React, { useState } from 'react';
// import { View, Text, Button, TextInput, ScrollView, CheckBox } from 'react-native';

export const CBTIQuestionnairePage = () => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const questions = [
    "How many hours of sleep do you typically get per night?",
    "How long does it take you to fall asleep?",
    "Does the presence of sound and light affect your sleep?",
    "Do you go to bed at the same time every night?",
    "How often do you wake up in the middle of the night on average?",
    "Do you have trouble waking up?",
    "Is there a sleeping position you particularly like?",
    "Which of these best describes you?",
    "Choose a sleep goal"
  ];
  const options = [
    { questionIndex: 0, type: "scroll", range: [1, 24] },
    { questionIndex: 1, type: "radio", choices: ["a", "b", "c", "d", "e"] },
    { questionIndex: 2, type: "radio", choices: ["a", "b"] },
    { questionIndex: 3, type: "radio", choices: ["a", "b", "c", "d", "e"] },
    { questionIndex: 4, type: "text" },
    { questionIndex: 5, type: "radio", choices: ["a", "b", "c", "d", "e"] },
    { questionIndex: 6, type: "checkbox", choices: ["Sideways", "On your back", "On your front"] },
    { questionIndex: 7, type: "radio", choices: ["a", "b", "c", "d", "e"] },
    { questionIndex: 8, type: "radio", choices: ["a", "b", "c", "d", "e"] }
  ];

  const submitAnswer = () => {
    // You can handle storing the answer based on the question index and the user's answer here
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
      setAnswer('');
      setSelectedOptions([]);
    } else {
      // Handle submission completion here
    }
  };

  const renderQuestion = () => {
    const currentQuestion = questions[questionIndex];
    const currentOptions = options.find(option => option.questionIndex === questionIndex);
    
    switch (currentOptions.type) {
      case "scroll":
        return (
          <ScrollView>
            <Text>{currentQuestion}</Text>
            <TextInput
              style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
              onChangeText={text => setAnswer(text)}
              value={answer}
              keyboardType="numeric"
            />
            <Button
              title="Submit"
              onPress={submitAnswer}
            />
          </ScrollView>
        );
      case "radio":
        return (
          <View>
            <Text>{currentQuestion}</Text>
            {currentOptions.choices.map(choice => (
              <Button
                key={choice}
                title={choice}
                onPress={() => setAnswer(choice)}
              />
            ))}
            <Button
              title="Submit"
              onPress={submitAnswer}
            />
          </View>
        );
      case "checkbox":
        return (
          <View>
            <Text>{currentQuestion}</Text>
            {currentOptions.choices.map(choice => (
              <CheckBox
                key={choice}
                title={choice}
                value={selectedOptions.includes(choice)}
                onValueChange={() => {
                  const newSelectedOptions = [...selectedOptions];
                  if (selectedOptions.includes(choice)) {
                    const index = newSelectedOptions.indexOf(choice);
                    newSelectedOptions.splice(index, 1);
                  } else {
                    newSelectedOptions.push(choice);
                  }
                  setSelectedOptions(newSelectedOptions);
                }}
              />
            ))}
            <Button
              title="Submit"
              onPress={submitAnswer}
            />
          </View>
        );
      case "text":
        return (
          <View>
            <Text>{currentQuestion}</Text>
            <TextInput
              style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
              onChangeText={text => setAnswer(text)}
              value={answer}
            />
            <Button
              title="Submit"
              onPress={submitAnswer}
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {renderQuestion()}
    </View>
  );
};
