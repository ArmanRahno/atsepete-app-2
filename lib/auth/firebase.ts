import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, GoogleAuthProvider } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
	apiKey: "AIzaSyDhGY2NuriESJ-CQF4SUsDIOzVp7oKZvKA",
	authDomain: "atsepete-4db6c.firebaseapp.com",
	projectId: "atsepete-4db6c",
	storageBucket: "atsepete-4db6c.firebasestorage.app",
	messagingSenderId: "945051079027",
	appId: "1:945051079027:web:7f35c7ea900618b2103506",
	measurementId: "G-M5BPSWY3VM"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let authInstance;

authInstance = initializeAuth(app, {
	persistence: getReactNativePersistence(AsyncStorage)
});

export const auth = authInstance;
export const googleProvider = new GoogleAuthProvider();
