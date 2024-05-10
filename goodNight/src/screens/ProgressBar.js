import React from "react";
import { View, Animated, StyleSheet } from "react-native";
import questionsData from "./QuizData";

// Component to display the progress of the quiz
const ProgressBar = ({ progress }) => {
    // Extract list of all questions from QuizData file
    const allQuestions = questionsData;
    // Set progress value to update the width of the progress bar
    const progressAnim = progress.interpolate({
        inputRange: [0, allQuestions.length],
        outputRange: ["0%", "100%"],
    });
    return (
        <View style={styles.progressBarContainer}>
        <Animated.View
            style={[
            {
                height: 5,
                borderRadius: 5,
                backgroundColor: "#EDA276" + "90",
            },
            {
                width: progressAnim,
            },
            ]}
        ></Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
  progressBarContainer: {
    width: "80%",
    height: 5,
    borderRadius: 5,
    backgroundColor: "#00000020",
    marginBottom: 10,
  },
});
export default ProgressBar;
