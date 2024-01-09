import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {get, getFirestore} from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';     
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
  apiKey: "AIzaSyCMWLJ8fL1RGZpRaJfo_NuJE509QwW4SyE",
  authDomain: "de-mo-firebase.firebaseapp.com",
  databaseURL: "https://de-mo-firebase-default-rtdb.firebaseio.com",
  projectId: "de-mo-firebase",
  storageBucket: "de-mo-firebase.appspot.com",
  messagingSenderId: "1087428441901",
  appId: "1:1087428441901:web:16956ad26a2955428685a4",
  measurementId: "G-0C7L0GKTVX"
};


// Khởi tạo Firebase App
const app = initializeApp(firebaseConfig);

// Sử dụng ReactNativeAsyncStorage cho cơ chế lưu trữ giữa các phiên
const authPersistence = getReactNativePersistence(ReactNativeAsyncStorage);

// Khởi tạo Firebase Auth với cơ chế lưu trữ đã được cấu hình
const initializedAuth = initializeAuth(app, { persistence: authPersistence });

// Khởi tạo Auth mà không cấu hình lưu trữ (để tránh cảnh báo)
const auth = getAuth(app);
const storage = getStorage(app);
// Khởi tạo Firestore
const database = getFirestore(app);

export { auth, database, initializedAuth,storage };

