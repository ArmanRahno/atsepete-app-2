// import Google from "@/assets/icons/Google";
// import { Text } from "react-native";
// import { TouchableOpacity } from "react-native";

// const ContinueWithGoogleBtn = () => {
// 	return (
// 		<TouchableOpacity
// 			className="flex-row items-center justify-center gap-2 bg-background border border-border rounded py-2 mt-4 disabled:bg-primary/80"
// 			// onPress={handleSubmit(onSubmit)}
// 			// disabled={isSubmitting}
// 		>
// 			{/* {isSubmitting ? (
// 						<ActivityIndicator
// 							color="white"
// 							size={20}
// 						/>
// 					) : ( */}
// 			<Google
// 				height={18}
// 				width={18}
// 			/>
// 			<Text className="text-foreground text-center font-semibold">Google ile devam et </Text>

// 			{/* )} */}
// 		</TouchableOpacity>
// 	);
// };

// export default ContinueWithGoogleBtn;

import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import GoogleIcon from "@/assets/icons/Google";

import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import checkAndStoreAccountPushNotificationToken from "@/lib/checkAndStoreAccountPushNotificationToken";
import { auth } from "@/lib/auth/firebase";

WebBrowser.maybeCompleteAuthSession();

type Props = {
	onSuccess: () => void;
	setServerMessage: (message: string) => void;
};

const ContinueWithGoogleBtn = ({ onSuccess, setServerMessage }: Props) => {
	const [loading, setLoading] = useState(false);

	const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
		androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
		webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
		// iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, // eklemek istersen
	});

	useEffect(() => {
		const handleResponse = async () => {
			if (!response || response.type !== "success") return;

			const idToken = response.params.id_token;
			if (!idToken) {
				setServerMessage("Google oturumu alınamadı.");
				return;
			}

			try {
				setLoading(true);
				setServerMessage("");

				// 1) Firebase'e Google credential ile giriş
				const credential = GoogleAuthProvider.credential(idToken);
				await signInWithCredential(auth, credential);

				const firebaseUser = auth.currentUser;
				const email = firebaseUser?.email ?? "google-user@example.com";
				const userAppRandId = await AsyncStorage.getItem("userAppRandId");

				// 2) Backend login (Firebase idToken ile)
				const endpoint =
					"https://atsepete-rework-6vep9h2qp-armans-projects-2ebbfea8.vercel.app/api/application/auth/login";

				const payload: any = {
					email,
					password: "___GOOGLE___", // Zod şema için dummy
					idToken,
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

				const token = data?.data?.sessionToken;
				if (token) {
					await AsyncStorage.setItem("user-session-token", token);
					await checkAndStoreAccountPushNotificationToken();
				}

				onSuccess();
			} catch (err) {
				console.error("Google login error:", err);
				setServerMessage("Google ile giriş yapılamadı.");
			} finally {
				setLoading(false);
			}
		};

		handleResponse();
	}, [response, onSuccess, setServerMessage]);

	const handlePress = useCallback(() => {
		setServerMessage("");
		if (!request) return;
		promptAsync();
	}, [request, promptAsync, setServerMessage]);

	return (
		<TouchableOpacity
			className="flex-row items-center justify-center gap-2 bg-background border border-border rounded py-2 mt-4 disabled:bg-primary/80"
			onPress={handlePress}
			disabled={!request || loading}
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
		</TouchableOpacity>
	);
};

export default ContinueWithGoogleBtn;
