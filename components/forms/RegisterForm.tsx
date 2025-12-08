// import React, { useState } from "react";
// import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
// import { useForm, Controller } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import checkAndStoreAccountPushNotificationToken from "@/lib/checkAndStoreAccountPushNotificationToken";
// import ContinueWithGoogleBtn from "../account-page/ContinueWithGoogleBtn";

// const RegisterSchema = z
// 	.object({
// 		email: z.string().email("Geçerli bir e-posta giriniz."),
// 		password: z.string().min(6, "Şifre en az 6 karakter olmalı."),
// 		confirmPassword: z.string().min(6, "Şifre en az 6 karakter olmalı.")
// 	})
// 	.refine(data => data.password === data.confirmPassword, {
// 		message: "Hatalı şifre tekrarı",
// 		path: ["confirmPassword"]
// 	});

// // TO-DO
// export default function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
// 	const [serverMessage, setServerMessage] = useState<string>("");
// 	const [serverStatus, setServerStatus] = useState<"success" | "error" | null>(null);

// 	const form = useForm({
// 		resolver: zodResolver(RegisterSchema),
// 		defaultValues: {
// 			email: "",
// 			password: "",
// 			confirmPassword: ""
// 		}
// 	});

// 	const {
// 		handleSubmit,
// 		control,
// 		formState: { errors, isSubmitting }
// 	} = form;

// 	const onSubmit = async (values: any) => {
// 		try {
// 			setServerStatus(null);
// 			setServerMessage("");
// 			const endpoint =
// 				"https://atsepete.net/api/application/auth/register";

// 			const userAppRandId = await AsyncStorage.getItem("userRandId");

// 			let payload = {
// 				email: values.email,
// 				password: values.password,
// 				confirmPassword: values.confirmPassword,
// 				userAppRandId
// 			};

// 			// const res = await fetch("https://atsepete.net/api/application/page/user-page", {
// 			// 	method: "GET",
// 			// 	credentials: "include"
// 			// });

// 			// console.log(res);

// 			const response = await fetch(endpoint, {
// 				method: "POST",
// 				headers: { "Content-Type": "application/json" },
// 				body: JSON.stringify(payload),
// 				credentials: "same-origin"
// 			});

// 			const data = await response.json();

// 			if (!response.ok) {
// 				setServerStatus("error");
// 				setServerMessage(data?.message || "İşlem sırasında bir hata oluştu.");
// 				return;
// 			} else {
// 				setServerStatus(data?.status === "success" ? "success" : "error");
// 				setServerMessage(data?.message || "İşlem başarılı!");
// 			}

// 			// TO-DO

// 			const loginEndpoint =
// 				"https://atsepete.net/api/application/auth/login";
// 			let loginPayload = {
// 				email: values.email,
// 				password: values.password,
// 				...(userAppRandId ? { userAppRandId } : {})
// 			};

// 			const loginResponse = await fetch(loginEndpoint, {
// 				method: "POST",
// 				headers: { "Content-Type": "application/json" },
// 				body: JSON.stringify(loginPayload),
// 				credentials: "include"
// 			});

// 			const loginData = await loginResponse.json();
// 			if (!loginResponse.ok) {
// 				setServerStatus("error");
// 				setServerMessage(loginData?.message || "İşlem sırasında bir hata oluştu.");
// 				return;
// 			} else {
// 				const token = loginData?.data?.sessionToken;
// 				if (!token) {
// 					setServerStatus("error");
// 					setServerMessage("İşlem sırasında bir hata oluştu.");
// 				}

// 				await AsyncStorage.setItem("user-session-token", token);

// 				await checkAndStoreAccountPushNotificationToken();

// 				onSuccess();
// 			}
// 		} catch (error) {
// 			console.error(error);
// 			setServerMessage("Bir hata oluştu. Lütfen tekrar deneyin.");
// 		}
// 	};

// 	return (
// 		<>
// 			<Text className="text-xl font-semibold mb-3 text-center">Hesap Oluşturma </Text>

// 			<Text className="mt-3">E-posta</Text>
// 			<Controller
// 				control={control}
// 				name="email"
// 				render={({ field: { onChange, onBlur, value } }) => (
// 					<TextInput
// 						className="border border-gray-300 p-2 rounded mt-1 text-foreground placeholder:text-muted-foreground"
// 						placeholder="E-posta adresi"
// 						keyboardType="email-address"
// 						autoCapitalize="none"
// 						onBlur={onBlur}
// 						onChangeText={onChange}
// 						value={value}
// 					/>
// 				)}
// 			/>
// 			{errors.email && (
// 				<Text className="text-red-500 mt-1 text-sm">{errors.email.message as string}</Text>
// 			)}

// 			<Text className="mt-3">Şifre</Text>
// 			<Controller
// 				control={control}
// 				name="password"
// 				render={({ field: { onChange, onBlur, value } }) => (
// 					<TextInput
// 						className="border border-gray-300 p-2 rounded mt-1 text-foreground placeholder:text-muted-foreground"
// 						placeholder="Şifreniz"
// 						secureTextEntry
// 						autoCapitalize="none"
// 						onBlur={onBlur}
// 						onChangeText={onChange}
// 						value={value}
// 					/>
// 				)}
// 			/>
// 			{errors.password && (
// 				<Text className="text-red-500 mt-1 text-sm">
// 					{errors.password.message as string}
// 				</Text>
// 			)}

// 			<Text className="mt-3">Şifre Tekrar</Text>
// 			<Controller
// 				control={control}
// 				name="confirmPassword"
// 				render={({ field: { onChange, onBlur, value } }) => (
// 					<TextInput
// 						className="border border-gray-300 p-2 rounded mt-1 text-foreground placeholder:text-muted-foreground"
// 						placeholder="Şifre tekrar"
// 						secureTextEntry
// 						autoCapitalize="none"
// 						onBlur={onBlur}
// 						onChangeText={onChange}
// 						value={value}
// 					/>
// 				)}
// 			/>
// 			{errors.confirmPassword && (
// 				<Text className="text-red-500 mt-1 text-sm">
// 					{errors.confirmPassword.message as string}
// 				</Text>
// 			)}

// 			{serverMessage ? (
// 				<Text
// 					className="text-destructive-foreground p-2 rounded mt-4 text-center"
// 					style={{ backgroundColor: serverStatus === "success" ? "#10b981" : "#ef4444" }}
// 				>
// 					{serverMessage}
// 				</Text>
// 			) : null}

// 			<AppTouchableOpacity
// 				className="bg-primary rounded py-2 mt-4 disabled:bg-primary/80"
// 				onPress={handleSubmit(onSubmit)}
// 				disabled={isSubmitting}
// 			>
// 				<Text className="text-primary-foreground text-center font-semibold">
// 					{isSubmitting ? (
// 						<ActivityIndicator
// 							color="white"
// 							size={20}
// 						/>
// 					) : (
// 						"Hesap Oluştur"
// 					)}
// 				</Text>
// 			<AppTouchableOpacity>

// 			<View className="flex-row items-center gap-2 mt-4">
// 				<View className="h-[1] flex-1 bg-muted" />
// 				<Text className="text-center text-muted-foreground">veya</Text>
// 				<View className="h-[1] flex-1 bg-muted" />
// 			</View>

// 			<ContinueWithGoogleBtn />
// 		</>
// 	);
// }

import React, { useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import AsyncStorage from "@react-native-async-storage/async-storage";
import checkAndStoreAccountPushNotificationToken from "@/lib/checkAndStoreAccountPushNotificationToken";
import ContinueWithGoogleBtn from "../account-page/ContinueWithGoogleBtn";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/auth/firebase";
import AppTouchableOpacity from "../AppTouchableOpacity";

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
	const [serverMessage, setServerMessage] = useState<string>("");
	const [serverStatus, setServerStatus] = useState<"success" | "error" | null>(null);

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
				credentials: "same-origin"
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
				await checkAndStoreAccountPushNotificationToken();

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
			<Text className="text-xl font-semibold mb-3 text-center">Hesap Oluşturma </Text>

			<Text className="mt-3">E-posta</Text>
			<Controller
				control={control}
				name="email"
				render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						className="border border-gray-300 p-2 rounded mt-1 text-foreground placeholder:text-muted-foreground"
						placeholder="E-posta adresi"
						keyboardType="email-address"
						autoCapitalize="none"
						onBlur={onBlur}
						onChangeText={onChange}
						value={value}
					/>
				)}
			/>
			{errors.email && (
				<Text className="text-red-500 mt-1 text-sm">{errors.email.message as string}</Text>
			)}

			<Text className="mt-3">Şifre</Text>
			<Controller
				control={control}
				name="password"
				render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						className="border border-gray-300 p-2 rounded mt-1 text-foreground placeholder:text-muted-foreground"
						placeholder="Şifreniz"
						secureTextEntry
						autoCapitalize="none"
						onBlur={onBlur}
						onChangeText={onChange}
						value={value}
					/>
				)}
			/>
			{errors.password && (
				<Text className="text-red-500 mt-1 text-sm">
					{errors.password.message as string}
				</Text>
			)}

			<Text className="mt-3">Şifre Tekrar</Text>
			<Controller
				control={control}
				name="confirmPassword"
				render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						className="border border-gray-300 p-2 rounded mt-1 text-foreground placeholder:text-muted-foreground"
						placeholder="Şifre tekrar"
						secureTextEntry
						autoCapitalize="none"
						onBlur={onBlur}
						onChangeText={onChange}
						value={value}
					/>
				)}
			/>
			{errors.confirmPassword && (
				<Text className="text-red-500 mt-1 text-sm">
					{errors.confirmPassword.message as string}
				</Text>
			)}

			{serverMessage ? (
				<Text
					className="text-destructive-foreground p-2 rounded mt-4 text-center"
					style={{ backgroundColor: serverStatus === "success" ? "#10b981" : "#ef4444" }}
				>
					{serverMessage}
				</Text>
			) : null}

			<AppTouchableOpacity
				className="bg-primary rounded py-2 mt-4 disabled:bg-primary/80"
				onPress={handleSubmit(onSubmit)}
				disabled={isSubmitting}
			>
				<Text className="text-primary-foreground text-center font-semibold">
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
		</>
	);
}
