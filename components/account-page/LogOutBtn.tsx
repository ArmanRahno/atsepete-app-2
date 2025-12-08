import removeNotificationToken from "@/lib/removeNotificationToken";
import { useCallback } from "react";
import { Text, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AccountAPIResponse } from "@/app/(tabs)/alarms";
import { auth } from "@/lib/auth/firebase";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import AppTouchableOpacity from "../AppTouchableOpacity";

const LogOutBtn = ({
	setIsLoggedIn,
	setUserData,
	setLoading
}: {
	setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
	setUserData: React.Dispatch<React.SetStateAction<AccountAPIResponse | null>>;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const handleLogout = useCallback(async () => {
		setLoading(true);

		try {
			// try {
			//   await removeNotificationToken();
			// } catch (err) {
			//   console.log("removeNotificationToken error (ignored on logout):", err);
			// }

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

			await AsyncStorage.removeItem("user-session-token");

			setIsLoggedIn(false);
			setUserData(null);
		} finally {
			setLoading(false);
		}
	}, [setIsLoggedIn, setUserData, setLoading]);

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
