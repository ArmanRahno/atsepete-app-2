import React, { useState } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ContinueWithGoogleBtn from "../account-page/ContinueWithGoogleBtn";
import ContinueWithAppleBtn from "../account-page/ContinueWithAppleBtn";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/auth/firebase";
import AppTouchableOpacity from "../AppTouchableOpacity";
import { useNotificationPermission } from "@/hooks/useNotificationPermission";
import { useResetOnAuth } from "@/hooks/useResetOnAuth";
import { useThemePalette } from "@/hooks/useThemePalette";

const RegisterSchema = z
	.object({
		email: z.string().email("Geçerli bir e-posta giriniz."),
		password: z.string().min(6, "Şifre en az 6 karakter olmalı."),
		confirmPassword: z.string().min(6, "Şifre en az 6 karakter olmalı.")
	})
	.refine(data => data.password === data.confirmPassword, {
		message: "Hatalı şifre tekrarı",
		path: ["confirmPassword"]
	});

export default function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
	const { colors } = useThemePalette();
	const [serverMessage, setServerMessage] = useState<string>("");
	const [serverStatus, setServerStatus] = useState<"success" | "error" | null>(null);

	const { askAndStoreAccountPushToken } = useNotificationPermission();
	const { bumpResetOnAuthEpoch } = useResetOnAuth();

	const form = useForm({
		resolver: zodResolver(RegisterSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: ""
		}
	});

	const {
		handleSubmit,
		control,
		formState: { errors, isSubmitting }
	} = form;

	const onSubmit = async (values: any) => {
		try {
			setServerStatus(null);
			setServerMessage("");

			const endpoint = "https://atsepete.net/api/application/auth/register";

			const userAppRandId = await AsyncStorage.getItem("userRandId");

			const payload = {
				email: values.email,
				password: values.password,
				confirmPassword: values.confirmPassword,
				userAppRandId
			};

			const response = await fetch(endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
				credentials: "include"
			});

			const data = await response.json();

			if (!response.ok || data?.status !== "success") {
				setServerStatus("error");
				setServerMessage(data?.message || "İşlem sırasında bir hata oluştu.");
				return;
			} else {
				setServerStatus("success");
				setServerMessage(data?.message || "İşlem başarılı!");
			}

			// Kayıttan sonra otomatik giriş
			const loginEndpoint = "https://atsepete.net/api/application/auth/login";

			let idToken: string | undefined;
			try {
				const cred = await signInWithEmailAndPassword(auth, values.email, values.password);
				idToken = await cred.user.getIdToken();
			} catch (firebaseError: any) {
				console.log(
					"Firebase login after register failed, falling back to legacy:",
					firebaseError?.code || firebaseError
				);
			}

			const loginPayload: any = {
				email: values.email,
				password: values.password,
				...(idToken ? { idToken } : {}),
				...(userAppRandId ? { userAppRandId } : {})
			};

			const loginResponse = await fetch(loginEndpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(loginPayload),
				credentials: "include"
			});

			const loginData = await loginResponse.json();
			if (!loginResponse.ok || loginData?.status !== "success") {
				setServerStatus("error");
				setServerMessage(loginData?.message || "İşlem sırasında bir hata oluştu.");
				return;
			} else {
				const token = loginData?.data?.sessionToken;
				if (!token) {
					setServerStatus("error");
					setServerMessage("İşlem sırasında bir hata oluştu.");
					return;
				}

				await AsyncStorage.setItem("user-session-token", token);
				await askAndStoreAccountPushToken("explicit");

				bumpResetOnAuthEpoch();
				onSuccess();
			}
		} catch (error) {
			console.error(error);
			setServerStatus("error");
			setServerMessage("Bir hata oluştu. Lütfen tekrar deneyin.");
		}
	};

	return (
		<>
			<Text
				className="text-xl font-semibold mb-4 text-center"
				style={{ color: colors.text }}
			>
				Hesap Oluşturma
			</Text>

			<Text
				className="mt-3 text-sm font-medium"
				style={{ color: colors.text }}
			>
				E-posta
			</Text>
			<Controller
				control={control}
				name="email"
				render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						className="h-12 border border-border bg-background px-4 rounded-xl mt-2 text-foreground"
						placeholder="E-posta adresi"
						placeholderTextColor={colors.mutedForeground}
						style={{ color: colors.text }}
						keyboardType="email-address"
						autoCapitalize="none"
						onBlur={onBlur}
						onChangeText={onChange}
						value={value}
					/>
				)}
			/>
			{errors.email && (
				<Text className="text-red-500 mt-2 text-sm">{errors.email.message as string}</Text>
			)}

			<Text
				className="mt-4 text-sm font-medium"
				style={{ color: colors.text }}
			>
				Şifre
			</Text>
			<Controller
				control={control}
				name="password"
				render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						className="h-12 border border-border bg-background px-4 rounded-xl mt-2 text-foreground"
						placeholder="Şifreniz"
						placeholderTextColor={colors.mutedForeground}
						style={{ color: colors.text }}
						secureTextEntry
						autoCapitalize="none"
						onBlur={onBlur}
						onChangeText={onChange}
						value={value}
					/>
				)}
			/>
			{errors.password && (
				<Text className="text-red-500 mt-2 text-sm">
					{errors.password.message as string}
				</Text>
			)}

			<Text
				className="mt-4 text-sm font-medium"
				style={{ color: colors.text }}
			>
				Şifre Tekrar
			</Text>
			<Controller
				control={control}
				name="confirmPassword"
				render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						className="h-12 border border-border bg-background px-4 rounded-xl mt-2 text-foreground"
						placeholder="Şifre tekrar"
						placeholderTextColor={colors.mutedForeground}
						style={{ color: colors.text }}
						secureTextEntry
						autoCapitalize="none"
						onBlur={onBlur}
						onChangeText={onChange}
						value={value}
					/>
				)}
			/>
			{errors.confirmPassword && (
				<Text className="text-red-500 mt-2 text-sm">
					{errors.confirmPassword.message as string}
				</Text>
			)}

			{serverMessage ? (
				<Text
					className="text-destructive-foreground px-4 py-3 rounded-xl mt-4 text-center"
					style={{ backgroundColor: serverStatus === "success" ? "#10b981" : "#ef4444" }}
				>
					{serverMessage}
				</Text>
			) : null}

			<AppTouchableOpacity
				className="h-12 bg-primary rounded-xl mt-4 disabled:bg-primary/80 items-center justify-center"
				onPress={handleSubmit(onSubmit)}
				disabled={isSubmitting}
			>
				<Text className="text-primary-foreground font-semibold">
					{isSubmitting ? (
						<ActivityIndicator
							color="white"
							size={20}
						/>
					) : (
						"Hesap Oluştur"
					)}
				</Text>
			</AppTouchableOpacity>

			<View className="flex-row items-center gap-2 mt-4">
				<View className="h-[1] flex-1 bg-muted" />
				<Text
					className="text-center text-muted-foreground"
					style={{ fontFamily: "Roboto_500Medium" }}
					textBreakStrategy="simple"
					android_hyphenationFrequency="none"
				>
					veya
				</Text>
				<View className="h-[1] flex-1 bg-muted" />
			</View>

			<ContinueWithGoogleBtn
				onSuccess={onSuccess}
				setServerMessage={setServerMessage}
			/>
			<ContinueWithAppleBtn
				onSuccess={onSuccess}
				setServerMessage={setServerMessage}
			/>
		</>
	);
}
