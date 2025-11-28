import removeNotificationToken from "@/lib/removeNotificationToken";
import { useCallback } from "react";
import { Text, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AccountAPIResponse } from "@/app/(tabs)/alarms";

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

		// This has to be done before removing the session token.
		// await removeNotificationToken();

		await AsyncStorage.removeItem("user-session-token");

		setIsLoggedIn(false);
		setUserData(null);
		setLoading(false);
	}, [setIsLoggedIn, setUserData]);

	return (
		<TouchableOpacity
			className="bg-amber-500 px-4 py-2 rounded-lg self-start mt-2"
			onPress={handleLogout}
		>
			<Text className="text-destructive-foreground font-medium">Çıkış Yap</Text>
		</TouchableOpacity>
	);
};
export default LogOutBtn;
