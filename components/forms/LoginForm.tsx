// import React, { useState } from "react";
// import { ActivityIndicator, Text, TextInput, TouchableOpacity } from "react-native";
// import { useForm, Controller } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import checkAndStoreAccountPushNotificationToken from "@/lib/checkAndStoreAccountPushNotificationToken";
// import ContinueWithGoogleBtn from "../account-page/ContinueWithGoogleBtn";
// import { View } from "react-native";

// const LoginSchema = z.object({
// 	email: z.string().email("Geçerli bir e-posta giriniz."),
// 	password: z.string().min(1, "Şifre girmeniz gereklidir.")
// });

// export default function LoginForm({ onSuccess }: { onSuccess: () => void }) {
// 	const [serverMessage, setServerMessage] = useState<string>("");

// 	const form = useForm({
// 		resolver: zodResolver(LoginSchema),
// 		defaultValues: {
// 			email: "",
// 			password: ""
// 		}
// 	});

// 	const {
// 		handleSubmit,
// 		control,
// 		formState: { errors, isSubmitting }
// 	} = form;

// 	const onSubmit = async (values: any) => {
// 		try {
// 			setServerMessage("");
// 			const endpoint =
// 				"https://atsepete.net/api/application/auth/login";

// 			const userAppRandId = await AsyncStorage.getItem("userRandId");

// 			let payload = {
// 				email: values.email,
// 				password: values.password,
// 				...(userAppRandId ? { userAppRandId } : {})
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
// 				credentials: "include"
// 			});

// 			const data = await response.json();
// 			if (!response.ok) {
// 				setServerMessage(data?.message || "İşlem sırasında bir hata oluştu.");
// 			} else {
// 				await AsyncStorage.setItem("user-session-token", data.data.sessionToken);

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
// 			<Text className="text-xl font-semibold mb-3 text-center">Giriş</Text>

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

// 			{serverMessage ? (
// 				<Text className="bg-destructive text-destructive-foreground p-2 rounded mt-4 text-center">
// 					{serverMessage}
// 				</Text>
// 			) : null}

// 			<TouchableOpacity
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
// 						"Giriş Yap"
// 					)}
// 				</Text>
// 			</TouchableOpacity>

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

const LoginSchema = z.object({
	email: z.string().email("Geçerli bir e-posta giriniz."),
	password: z.string().min(1, "Şifre girmeniz gereklidir.")
});

export default function LoginForm({ onSuccess }: { onSuccess: () => void }) {
	const [serverMessage, setServerMessage] = useState<string>("");

	const form = useForm({
		resolver: zodResolver(LoginSchema),
		defaultValues: {
			email: "",
			password: ""
		}
	});

	const {
		handleSubmit,
		control,
		formState: { errors, isSubmitting }
	} = form;

	const onSubmit = async (values: any) => {
		try {
			setServerMessage("");

			const endpoint = "https://atsepete.net/api/application/auth/login";

			const userAppRandId = await AsyncStorage.getItem("userRandId");

			let idToken: string | undefined;
			try {
				const cred = await signInWithEmailAndPassword(auth, values.email, values.password);
				idToken = await cred.user.getIdToken();
			} catch (firebaseError: any) {
				console.log(
					"Firebase email/password login failed, falling back to legacy Mongo:",
					firebaseError?.code || firebaseError
				);
			}

			const payload: any = {
				email: values.email,
				password: values.password,
				...(idToken ? { idToken } : {}),
				...(userAppRandId ? { userAppRandId } : {})
			};

			const response = await fetch(endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
				credentials: "include"
			});

			const data = await response.json();
			if (!response.ok || data?.status !== "success") {
				setServerMessage(data?.message || "İşlem sırasında bir hata oluştu.");
			} else {
				const token = data?.data?.sessionToken;
				if (token) {
					await AsyncStorage.setItem("user-session-token", token);
					await checkAndStoreAccountPushNotificationToken();
				}

				onSuccess();
			}
		} catch (error) {
			console.error(error);
			setServerMessage("Bir hata oluştu. Lütfen tekrar deneyin.");
		}
	};

	return (
		<>
			<Text className="text-xl font-semibold mb-3 text-center">Giriş</Text>

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

			{serverMessage ? (
				<Text className="bg-destructive text-destructive-foreground p-2 rounded mt-4 text-center">
					{serverMessage}
				</Text>
			) : null}

			<TouchableOpacity
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
						"Giriş Yap"
					)}
				</Text>
			</TouchableOpacity>

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
