import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useAuthStatus() {
	const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

	useEffect(() => {
		let isMounted = true;

		(async () => {
			try {
				const token = await AsyncStorage.getItem("user-session-token");
				if (isMounted) {
					setIsLoggedIn(!!token);
				}
			} catch (e) {
				console.warn("Failed to read user-session-token", e);
				if (isMounted) {
					setIsLoggedIn(false);
				}
			}
		})();

		return () => {
			isMounted = false;
		};
	}, []);

	return { isLoggedIn };
}
