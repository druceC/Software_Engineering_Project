import React, { useState } from "react";
import {View, Text, ScrollView, Animated, StyleSheet, TouchableOpacity,} from "react-native";
import questionsData from "./QuizData";
import Questions from "./Questions";
import ProgressBar from "./ProgressBar";

const sleepEvaluationPage = ({ navigation }) => {
  // Define questionnaire variables
  const questionList = questionsData;
  const [currentQuestionIndex, setCurrentIndex] = useState(0);
  const [currentOptionSelected, optionSelected] = useState(null);
  // Initialize score to 28 (max score)
  const [score, setScore] = useState(28);
  // Define animation variables for fading in and fading put
  const [progress, setProgress] = useState(new Animated.Value(1));
  const [fadeAnim, setFadeAnim] = useState(new Animated.Value(1));
  
  // Function to reset the quiz
  const reset = () => {
    setCurrentIndex(0);
    setScore(0);
    optionSelected(null);
  };
  // Select current option
  const selectAnswer = (selectedOption, navigation) => {
      let currentArr = questionList[currentQuestionIndex]["options"];
      optionSelected(selectedOption);
  };
  // Go to next question and calculate score based on selected option
  const handleNext = (selectedOption, navigation) => {
    let currentArr = questionList[currentQuestionIndex]["options"];
    if (currentQuestionIndex === questionList.length - 1) {
      navigation.navigate("Result", { score: score, reset: reset });
    } else {
      // If user is not yet on the last question (set sleep goal question)
      if (currentQuestionIndex !== 7) {
        optionSelected(selectedOption);
        // Update the score upon clicking next button
        for (let i = 0; i < currentArr.length; i++) {
          if (currentArr[i] === selectedOption) {
            setScore(score - i);
          }
        }
      } else {
        // If user is on the sleep goal question, do not update score
        optionSelected(selectedOption);
        setScore(score - 0);
      }
      setCurrentIndex(currentQuestionIndex + 1);
      optionSelected(null);
    }
    // Animation for progress bar and fading effect
    Animated.parallel([
      Animated.timing(progress, {
        toValue: currentQuestionIndex + 2,
        duration: 2000,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1900,
          useNativeDriver: false,
        }),
      ]),
    ]).start();
  };
  // Function to display questionnaire options
  const renderOptions = (navigation) => {
    return (
      <View style={styles.optionsContainer}>
        {questionList[currentQuestionIndex]?.options.map((option, index) => (
          <Animated.View
            key={index}
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateX: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-(150 / 4) * (index + 10), 0],
                  }),
                },
              ],
            }}
          >
            <TouchableOpacity
              onPress={() => selectAnswer(option, navigation)}
              style={[
                styles.optionButton,
                {
                  backgroundColor: option === currentOptionSelected ? "#0F2E57" : "#cfcdcc",
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: option === currentOptionSelected ? "white" : "black",
                  textAlign: "center",
                }}
              >
                {option}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <View style={styles.subContainer}>
          <ProgressBar progress={progress} />
          <Questions
            index={currentQuestionIndex}
            question={questionList[currentQuestionIndex]?.question}
          />
        </View>
        {renderOptions(navigation)}
        <View style={styles.nextButtonContainer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              {
                backgroundColor: !currentOptionSelected ? "#cfcdcc" : "#ffffff",
              },
            ]}
            disabled={!currentOptionSelected}
            onPress={() => handleNext(currentOptionSelected, navigation)}
          >
            <Text style={styles.nextButtonText}>NEXT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: { backgroundColor: "#282c34" },
  container: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 20,
    position: "relative",
  },
  subContainer: {
    marginTop: 20,
    marginVertical: 0,
    padding: 40,
    borderTopRightRadius: 40,
    borderRadius: 10,
    backgroundColor: "white",
    alignItems: "center",
    shadowColor: "#171717",
    shadowOffset: { width: -6, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    bottom: -20,
  },
  optionsContainer: { marginTop: 100 },
  optionButton: {
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    paddingHorizontal: 30,
    marginVertical: 5,
    shadowColor: "#171717",
    shadowOffset: { width: -3, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    bottom: 40,
  },
  nextButtonContainer: { position: "absolute", bottom: 0, right: 20 },
  nextButton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    zIndex: 10,
  },
  nextButtonText: {
    color: "#333",
    fontSize: 17,
    letterSpacing: 1.1,
    zIndex: 11,
  },
});

export default sleepEvaluationPage;
