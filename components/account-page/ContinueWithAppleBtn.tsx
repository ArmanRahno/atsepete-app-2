import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Platform, Text } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { OAuthProvider, signInWithCredential } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { auth } from "@/lib/auth/firebase";
import AppTouchableOpacity from "../AppTouchableOpacity";
import { useNotificationPermission } from "@/hooks/useNotificationPermission";
import { useResetOnAuth } from "@/hooks/useResetOnAuth";

type Props = {
	onSuccess: () => void;
	setServerMessage: (message: string) => void;
};

const LOGIN_ENDPOINT = "https://atsepete.net/api/application/auth/login";
const NONCE_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._";

function generateNonce(length = 32) {
	const randomBytes = Crypto.getRandomBytes(length);

	return Array.from(randomBytes)
		.map(byte => NONCE_CHARSET[byte % NONCE_CHARSET.length])
		.join("");
}

const ContinueWithAppleBtn = ({ onSuccess, setServerMessage }: Props) => {
	const [isAvailable, setIsAvailable] = useState(false);
	const [loading, setLoading] = useState(false);

	const { askAndStoreAccountPushToken } = useNotificationPermission();
	const { bumpResetOnAuthEpoch } = useResetOnAuth();

	useEffect(() => {
		if (Platform.OS !== "ios") return;

		let mounted = true;

		AppleAuthentication.isAvailableAsync()
			.then(available => {
				if (mounted) setIsAvailable(available);
			})
			.catch(() => {
				if (mounted) setIsAvailable(false);
			});

		return () => {
			mounted = false;
		};
	}, []);

	const handlePress = useCallback(async () => {
		if (loading) return;

		try {
			setServerMessage("");
			setLoading(true);

			const rawNonce = generateNonce();
			const hashedNonce = await Crypto.digestStringAsync(
				Crypto.CryptoDigestAlgorithm.SHA256,
				rawNonce
			);

			const appleCredential = await AppleAuthentication.signInAsync({
				requestedScopes: [
					AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
					AppleAuthentication.AppleAuthenticationScope.EMAIL
				],
				nonce: hashedNonce
			});

			if (!appleCredential.identityToken) {
				setServerMessage("Apple oturumu alınamadı.");
				return;
			}

			const provider = new OAuthProvider("apple.com");
			const credential = provider.credential({
				idToken: appleCredential.identityToken,
				rawNonce
			});

			const userCred = await signInWithCredential(auth, credential);

			const firebaseIdToken = await userCred.user.getIdToken();
			const email = userCred.user.email ?? appleCredential.email;
			if (!email) {
				setServerMessage("Apple hesabınızda email bilgisi bulunamadı.");
				return;
			}

			const userAppRandId = await AsyncStorage.getItem("userRandId");

			const payload: any = {
				email,
				password: "___APPLE___",
				idToken: firebaseIdToken,
				...(userAppRandId ? { userAppRandId } : {})
			};

			const res = await fetch(LOGIN_ENDPOINT, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
				credentials: "include"
			});

			const data = await res.json();

			if (!res.ok || data?.status !== "success") {
				setServerMessage(data?.message || "Apple ile giriş yapılamadı.");
				return;
			}

			const sessionToken = data?.data?.sessionToken;
			if (!sessionToken) {
				setServerMessage("Oturum bilgisi alınamadı.");
				return;
			}

			await AsyncStorage.setItem("user-session-token", sessionToken);
			await askAndStoreAccountPushToken("explicit");

			bumpResetOnAuthEpoch();
			onSuccess();
		} catch (err: any) {
			if (err?.code === "ERR_REQUEST_CANCELED") {
				return;
			}

			console.error("Apple sign in error:", err);
			setServerMessage("Apple ile giriş yapılamadı.");
		} finally {
			setLoading(false);
		}
	}, [loading, onSuccess, setServerMessage, askAndStoreAccountPushToken, bumpResetOnAuthEpoch]);

	if (!isAvailable) return null;

	return (
		<AppTouchableOpacity
			className="mt-3 h-12 flex-row items-center justify-center gap-2 rounded-xl disabled:opacity-65"
			style={{
				backgroundColor: "#000",
				borderColor: "rgba(255,255,255,0.24)",
				borderWidth: 1
			}}
			onPress={handlePress}
			disabled={loading}
		>
			{loading ? (
				<ActivityIndicator
					color="#fff"
					size={20}
				/>
			) : (
				<>
					<FontAwesome
						name="apple"
						size={20}
						color="#fff"
					/>
					<Text
						className="text-white text-center"
						style={{ fontSize: 15, fontWeight: "600", letterSpacing: 0 }}
					>
						Apple ile devam et
					</Text>
				</>
			)}
		</AppTouchableOpacity>
	);
};

export default ContinueWithAppleBtn;
