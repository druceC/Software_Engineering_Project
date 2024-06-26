import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const Result = ({ navigation, route }) => {
    // Extract sleep score
    const { score } = route.params;
    // Get current user's userID to be used for saving his score to the database
    const uid = auth().currentUser.uid;

    // Function to evaluate user's sleep quality based on his sleep score from the ISI (Insomnia Severity Index)
    const sleepMessage = (score) => {
        if (score >= 21) {
          return "Excellent Sleep Health";
        } else if (score >= 14) {
          return "Suboptimal Sleep Health";
        } else if (score >= 13) {
          return "Clinical Insomnia";
        } else {
          return "Severe Clinical Insomnia";
        }
    };
    // Save user's sleep score and username to Firestore
    const saveSleepScoreToFirestore = async (score, uid) => {
        try {
            await firestore().collection('sleepScore').add({
                score: score,
                uid: uid,
                timestamp: firestore.FieldValue.serverTimestamp()
            });
            console.log("Sleep score saved successfully!");
        } catch (error) {
          console.error("Error saving sleep score: ", error);
        }
    };
    // useEffect hook to save sleep score to Firestore on component mount
    useEffect(() => {
        saveSleepScoreToFirestore(score, uid);
    }, []);

    return (
        <View style={styles.container}>
        <View style={styles.subContainer}>
            <Text style={styles.sleepMessage}>{sleepMessage(score)}</Text>
            <Text style={styles.textScore}>Your Sleep Score</Text>

            <View style={styles.textWrapper}>
            <Text style={styles.score}>{score}</Text>
            <Text style={styles.score}> / 28</Text>
            </View>
            {/* Retry Quiz button */}
            <TouchableOpacity
            onPress={() => {
                navigation.navigate("Welcome");
            }}
          style={styles.btnRedo}
        >
          <Text style={styles.btnText}>Proceed</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#414958",
    alignItems: "center",
    justifyContent: "center",
  },
  subContainer: {
    backgroundColor: "#282c34",
    height: "65%",
    width: "90%",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 150,
    resizeMode: "contain",
  },
  textWrapper: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginVertical: 30,
  },
  sleepMessage: {
      padding: 20,
      paddingVertical: 40,
      fontSize: 40,
      textAlign: "center",
      color: "#FFDE82",
      fontWeight: "bold",
  },
  textScore: {
      fontSize: 20,
      color: "#ffffff",
      fontWeight: "bold",
  },
  score: {
    fontSize: 40,
    color: "#ffffff",
    fontWeight: "bold",
  },
  btnRedo: {
    backgroundColor: "#333",
    paddingHorizontal: 5,
    paddingVertical: 15,
    width: "50%",
    borderRadius: 15,
  },
  btnText: {
    textAlign: "center",
    color: "#ffffff",
    fontSize: 20,
    letterSpacing: 1,
  },
});
export default Result;
