import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDat4mEjt-U4cRBLq-6yKr7hew7dugwCU8",
  authDomain: "goodnight-23bd4.firebaseapp.com",
  databaseURL: "https://goodnight-23bd4-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "goodnight-23bd4",
  storageBucket: "goodnight-23bd4.appspot.com",
  messagingSenderId: "506276774022",
  appId: "1:506276774022:android:229cf128b2a06b15b65107"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;