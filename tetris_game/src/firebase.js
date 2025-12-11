import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "tetris-c1568.firebaseapp.com",
  databaseURL: "https://tetris-c1568-default-rtdb.firebaseio.com",
  projectId: "tetris-c1568",
  storageBucket: "tetris-c1568.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
