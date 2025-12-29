import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ONBOARDING_KEY } from "@/app/(onboarding)/onboarding";

export function OnboardingGate() {
	const router = useRouter();

	useEffect(() => {
		let cancelled = false;

		(async () => {
			const seen = await AsyncStorage.getItem(ONBOARDING_KEY);

			if (cancelled) return;

			if (seen !== "true") router.replace("/(onboarding)/onboarding");
		})();

		return () => {
			cancelled = true;
		};
	}, [router]);

	return null;
}
