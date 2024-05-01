import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const Result = ({ navigation, route }) => {
    const { score } = route.params;
    const uid = auth().currentUser.uid;
    // const uid = await firestore().collection('usernames').get();

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
    useEffect(() => {
        saveSleepScoreToFirestore(score, uid);
    }, []);

    return (
        <View style={styles.container}>
        <View style={styles.subContainer}>
            <Text style={{ fontSize: 50 }}>Your Sleep Score</Text>

            <View style={styles.textWrapper}>
            <Text style={styles.score}>{score}</Text>
            <Text style={styles.score}> / 28</Text>
            </View>
            {/* Retry Quiz button */}
            <TouchableOpacity
            onPress={() => {
                navigation.navigate("Welcome");
          }}
          style={styles.btnReset}
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
    backgroundColor: "#38588b",
    alignItems: "center",
    justifyContent: "center",
  },
  subContainer: {
    backgroundColor: "#38588b",
    width: "90%",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  textWrapper: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginVertical: 30,
  },
  score: {
    fontSize: 100,
    color: "#ffffff",
    fontWeight: "bold",
  },
  btnReset: {
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
