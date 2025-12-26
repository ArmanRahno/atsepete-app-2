import { useCallback } from "react";
import { Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AccountAPIResponse } from "@/app/(tabs)/alarms";
import { auth } from "@/lib/auth/firebase";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import AppTouchableOpacity from "../AppTouchableOpacity";
import { useResetOnAuth } from "@/hooks/useResetOnAuth";

const REFERRER_CODE_KEY = "user-referrer-code";
const LOGOUT_URL = "https://atsepete.net/api/application/auth/logout";

const LogOutBtn = ({
	setIsLoggedIn,
	setUserData,
	setLoading
}: {
	setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
	setUserData: React.Dispatch<React.SetStateAction<AccountAPIResponse | null>>;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const { bumpResetOnAuthEpoch } = useResetOnAuth();

	const handleLogout = useCallback(async () => {
		setLoading(true);

		try {
			try {
				const res = await fetch(LOGOUT_URL, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include"
				});
				if (!res.ok) {
					console.log("Logout endpoint failed:", res.status);
				}
			} catch (err) {
				console.log("Logout endpoint error:", err);
			}

			try {
				await auth.signOut();
			} catch (err) {
				console.log("Firebase auth.signOut error (ignored on logout):", err);
			}

			try {
				await GoogleSignin.signOut();
			} catch (err) {
				console.log("GoogleSignin.signOut error (ignored on logout):", err);
			}

			await AsyncStorage.removeItem(REFERRER_CODE_KEY);
			await AsyncStorage.removeItem("user-session-token");

			setIsLoggedIn(false);
			setUserData(null);

			bumpResetOnAuthEpoch();
		} finally {
			setLoading(false);
		}
	}, [setLoading, setIsLoggedIn, setUserData, bumpResetOnAuthEpoch]);

	return (
		<AppTouchableOpacity
			className="bg-amber-500 px-4 py-2 rounded-lg self-start mt-2"
			onPress={handleLogout}
		>
			<Text className="text-destructive-foreground font-medium">Çıkış Yap</Text>
		</AppTouchableOpacity>
	);
};

export default LogOutBtn;
