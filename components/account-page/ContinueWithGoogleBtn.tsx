import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import GoogleIcon from "@/assets/icons/Google";

import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "@/lib/auth/firebase";
import AppTouchableOpacity from "../AppTouchableOpacity";
import { useAccountNotificationPermission } from "@/hooks/useAccountNotificationPermission";

type Props = {
	onSuccess: () => void;
	setServerMessage: (message: string) => void;
};

const ContinueWithGoogleBtn = ({ onSuccess, setServerMessage }: Props) => {
	const [loading, setLoading] = useState(false);

	const { askAndStoreAccountPushToken } = useAccountNotificationPermission();

	useEffect(() => {
		GoogleSignin.configure({
			webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
			offlineAccess: false
		});
	}, []);

	const handlePress = useCallback(async () => {
		try {
			setServerMessage("");
			setLoading(true);

			await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

			const userInfo = await GoogleSignin.signIn();

			const idToken = userInfo.data?.idToken;
			if (!idToken) {
				setServerMessage("Google oturumu alınamadı.");
				return;
			}

			const credential = GoogleAuthProvider.credential(idToken);
			const userCred = await signInWithCredential(auth, credential);

			const firebaseIdToken = await userCred.user.getIdToken();
			const email = userCred.user.email ?? userInfo.data?.user.email;

			const userAppRandId = await AsyncStorage.getItem("userRandId");

			const endpoint = "https://atsepete.net/api/application/auth/login";

			const payload: any = {
				email,
				password: "___GOOGLE___",
				idToken: firebaseIdToken,
				...(userAppRandId ? { userAppRandId } : {})
			};

			const res = await fetch(endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload)
			});

			const data = await res.json();

			if (!res.ok || data?.status !== "success") {
				setServerMessage(data?.message || "Google ile giriş yapılamadı.");
				return;
			}

			const sessionToken = data?.data?.sessionToken;
			if (sessionToken) {
				await AsyncStorage.setItem("user-session-token", sessionToken);
				await askAndStoreAccountPushToken();
			}

			onSuccess();
		} catch (err: any) {
			if (err?.code === statusCodes.SIGN_IN_CANCELLED) {
				return;
			}

			console.error("Google sign in error:", err);
			setServerMessage("Google ile giriş yapılamadı.");
		} finally {
			setLoading(false);
		}
	}, [onSuccess, setServerMessage, askAndStoreAccountPushToken]);

	return (
		<AppTouchableOpacity
			className="flex-row items-center justify-center gap-2 bg-background border border-border rounded py-2 mt-4 disabled:bg-gray-100"
			onPress={handlePress}
			disabled={loading}
		>
			{loading ? (
				<ActivityIndicator
					color="black"
					size={20}
				/>
			) : (
				<>
					<GoogleIcon
						height={18}
						width={18}
					/>
					<Text className="text-foreground text-center font-semibold">
						Google ile devam et
					</Text>
				</>
			)}
		</AppTouchableOpacity>
	);
};

export default ContinueWithGoogleBtn;
