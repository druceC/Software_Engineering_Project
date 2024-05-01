import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Animated,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import data from "./QuizData";
import ProgressBar from "./ProgressBar";
import Questions from "./Questions";

const QuizPage = ({ navigation }) => {
    const allQuestions = data;

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [progress, setProgress] = useState(new Animated.Value(1));
    const [fadeAnim, setFadeAnim] = useState(new Animated.Value(1));

    const [isOptionsDisabled, setIsOptionsDisabled] = useState(false);
    const [currentOptionSelected, setCurrentOptionSelected] = useState(null);
    const [correctOption, setCorrectOption] = useState(null);
    const [score, setScore] = useState(28);

    const restartQuiz = () => {
        setCurrentQuestionIndex(0);
        setScore(0);
        setCurrentOptionSelected(null);
        setCorrectOption(null);
        setIsOptionsDisabled(false);
    };
    const validateAnswer = (selectedOption, navigation) => {
        if (isOptionsDisabled == false) {
            let currentArr = allQuestions[currentQuestionIndex]["options"];
            if(currentQuestionIndex!=7){
                setCurrentOptionSelected(selectedOption);
                for(let i=0; i<currentArr.length; i++){
                    if (currentArr[i]==selectedOption){
                        setScore(score - i);
                    }
                }
            }
            else{
                setCurrentOptionSelected(selectedOption);
                setScore(score - 0);
            }
            // setCurrentOptionSelected(selectedOption);
            // setCorrectOption(correct_option);
            // setIsOptionsDisabled(true);
            // if (selectedOption == correct_option) {
            //     setScore(score + 1);
            // }
            setIsOptionsDisabled(true);
        }
    };
    // const validateAnswer = (selectedOption, navigation) => {
    //     // if (isOptionsDisabled == false) {
    //     // setCurrentOptionSelected(selectedOption);
    //     // let correct_option = allQuestions[currentQuestionIndex]["correct_option"];

    //     // setCurrentOptionSelected(selectedOption);
    //     // setCorrectOption(correct_option);
    //     // setIsOptionsDisabled(true);
    //     // if (selectedOption == correct_option) {
    //     //     setScore(score + 1);
    //     // }
    //     // }
    //     if(currentQuestionIndex!=7){
    //         setScore(score+selectedOption);
    //     }
    //     else{
    //         // Set last question as sleep goal
    //     }
    // };
    const handleNext = (navigation) => {
        if (currentQuestionIndex == allQuestions.length - 1) {
        navigation.navigate("Result", { score: score, restartQuiz: restartQuiz });
        } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setCurrentOptionSelected(null);
        setCorrectOption(null);
        setIsOptionsDisabled(false);
        }
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

  const renderOptions = (navigation) => {
    return (
      <View style={{ marginTop: 100 }}>
        {allQuestions[currentQuestionIndex]?.options.map((option, index) => (
          <Animated.View
            key={index}
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [(150 / 4) * (index + 10), 0], // 0 : 150, 0.5 : 75, 1 : 0
                  }),
                },
              ],
            }}
          >
            <TouchableOpacity
                onPress={() => validateAnswer(option, navigation)}
                key={index}
                style={[
                { ...styles.optionsText },
                {
                    backgroundColor: isOptionsDisabled
                    ? option == correctOption
                        ? "#7be25b"
                        : option == currentOptionSelected
                        ? "#0F2E57" 
                        : "#cfcdcc" 
                    : "#fac782",
                },
                ]}
            //   onPress={() => validateAnswer(option, navigation)}
            //   key={index}
            //   style={[
            //     { ...styles.optionsText },
            //     {
            //       backgroundColor: isOptionsDisabled
            //         ? option == correctOption
            //           ? "#7be25b"
            //           : option == currentOptionSelected
            //           ? "#0F2E57" //red
            //           : "#cfcdcc" //gray
            //         : "#fac782",
            //     },
            //   ]}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: option == currentOptionSelected ? 'white' : 'black',
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
            question={allQuestions[currentQuestionIndex]?.question}
          />
        </View>
        {renderOptions(navigation)}
      </View>
      <View style={{ position: "absolute", bottom: 0, right: 20 }}>
        <TouchableOpacity
          style={[
            { ...styles.btnNext },
            {
              backgroundColor: !currentOptionSelected ? "#cfcdcc" : "#ffffff",
            },
          ]}
          disabled={!currentOptionSelected}
          onPress={() => handleNext(navigation)}
        >
          <Text style={styles.btnNextText}>NEXT</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// const styles = StyleSheet.create({
//     scrollView: { backgroundColor: "#38588b" },
//     container: {
//       flex: 1,
//       paddingVertical: 10,
//       paddingHorizontal: 20,
//       position: "relative",
//     },
//     subContainer: {
//       marginTop: "13%", // Adjusted marginTop to position subContainer above 2/3 of the page
//       marginVertical: 0,
//       padding: 40,
//       borderTopRightRadius: 40,
//       borderRadius: 10,
//       backgroundColor: "white",
//       alignItems: "center",
//       shadowColor: "#171717",
//       shadowOffset: { width: -6, height: 6 },
//       shadowOpacity: 0.2,
//       shadowRadius: 3,
//     //   bottom: "63%",
//     },
//     optionsText: {
//       borderRadius: 5,
//       alignItems: "center",
//       justifyContent: "center",
//       padding: 10,
//       paddingHorizontal: 30,
//       marginVertical: 5,
//       shadowColor: "#171717",
//       shadowOffset: { width: -3, height: 3 },
//       shadowOpacity: 0.2,
//       shadowRadius: 3,
//       bottom: "83%",
//     },
//     btnNext: {
//       borderRadius: 10,
//       paddingVertical: 10,
//       paddingHorizontal: 20,
//       backgroundColor: "#ffffff",
//       position: "absolute",
//       bottom: "20%",
//       right: 20,
//     },
//     btnNextText: {
//       color: "#333",
//       fontSize: 17,
//       letterSpacing: 1.1,
//     },
//   });

const styles = StyleSheet.create({
  scrollView: { backgroundColor: "#38588b" },
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
    bottom: -20
  },
  optionsText: {
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
    bottom: 40
  },
  btnNext: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    zIndex: 10,
    // bottom: "500%"
  },
  btnNextText: {
    color: "#333",
    fontSize: 17,
    letterSpacing: 1.1,
    zIndex: 11
  },
});
export default QuizPage;