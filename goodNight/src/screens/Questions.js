import React from "react";
import { View, Text, StyleSheet } from "react-native";
import data from "./QuizData";

// Test question counter display
const Questions = ({ index, question }) => {
  return (
    // Main container
    React.createElement(View, { style: {} },
      // Question counter
      React.createElement(View, 
        { style: { 
          flexDirection: "row", 
          alignItems: "flex-end" 
        } },
        // Question index
        React.createElement(Text, 
          { style: { 
            color: "#333", 
            fontSize: 15, 
            opacity: 0.6, 
            marginRight: 2 } }, 
            index + 1),
        // Total # of question
        React.createElement(Text, 
          { style: { 
            color: "#333", 
            fontSize: 13, 
            opacity: 0.6 } }, 
            `/ ${data.length}`)
      ),
      // Actual question text
      React.createElement(Text, 
        { style: { 
          color: "#333", 
          fontSize: 18, 
          textAlign: "center" 
        } }, question)
    )
  );
};

const styles = StyleSheet.create({});

export default Questions;
