import React, { useState } from "react";
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Modal,
	Text,
	TextInput,
	View
} from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import AppTouchableOpacity from "@/components/AppTouchableOpacity";
import Header from "@/components/header/Header";
import HeaderIcon from "@/components/header/HeaderIcon";
import HeaderSecondRow from "@/components/header/HeaderSecondRow";
import { Card } from "@/components/shad-cn/card";

const ChangeSchema = z
	.object({
		oldPassword: z.string().min(1, "Mevcut şifre gerekli."),
		newPassword: z.string().min(6, "Yeni şifre en az 6 karakter olmalı."),
		confirmNewPassword: z.string().min(6, "Yeni şifre en az 6 karakter olmalı.")
	})
	.refine(v => v.newPassword === v.confirmNewPassword, {
		message: "Yeni şifreler eşleşmiyor.",
		path: ["confirmNewPassword"]
	})
	.refine(v => v.oldPassword !== v.newPassword, {
		message: "Yeni şifre mevcut şifreyle aynı olamaz.",
		path: ["newPassword"]
	});

type ChangeValues = z.infer<typeof ChangeSchema>;

type ChangeRes =
	| { status: "success"; message: string }
	| { status: "error"; message: string; code?: string };

const ENDPOINT = "https://atsepete.net/api/application/auth/change-password";

export default function ChangePasswordScreen() {
	const router = useRouter();

	const [serverError, setServerError] = useState("");
	const [successOpen, setSuccessOpen] = useState(false);
	const [successMessage, setSuccessMessage] = useState("Şifreniz güncellendi.");

	const form = useForm<ChangeValues>({
		resolver: zodResolver(ChangeSchema),
		defaultValues: { oldPassword: "", newPassword: "", confirmNewPassword: "" }
	});

	const {
		handleSubmit,
		control,
		setError,
		formState: { errors, isSubmitting }
	} = form;

	const closeAndGoBack = () => {
		setSuccessOpen(false);
		router.back();
	};

	const onSubmit = async (values: ChangeValues) => {
		try {
			setServerError("");

			const r = await fetch(ENDPOINT, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					oldPassword: values.oldPassword,
					newPassword: values.newPassword
				}),
				credentials: "include"
			});

			const res = (await r.json().catch(() => null)) as ChangeRes | null;

			if (res && res.status === "error" && res.code === "LOGIN_REQUIRED") {
				router.replace("/(tabs)/account");
				return;
			}

			if (!r.ok || !res || res.status === "error") {
				if (res && res.status === "error") {
					if (res.code === "INVALID_OLD_PASSWORD") {
						setError("oldPassword", { message: "Mevcut şifre hatalı." });
						return;
					}

					if (res.code === "CANNOT_CHANGE_PASSWORD") {
						setServerError("Bu hesap için şifre değiştirilemez.");
						return;
					}

					if (res.code === "LOGIN_REQUIRED") {
						router.replace("/(tabs)/account");
						return;
					}

					setServerError(res.message || "Bir hata oluştu.");
					return;
				}

				setServerError("Bir hata oluştu.");
				return;
			}

			setSuccessMessage(res.message || "Şifreniz güncellendi.");
			setSuccessOpen(true);
			form.reset({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
		} catch (e) {
			console.error(e);
			setServerError("Bir hata oluştu. Lütfen tekrar deneyin.");
		}
	};

	return (
		<>
			<Header className="shadow-none">
				<HeaderIcon />
				<HeaderSecondRow />
			</Header>

			<Modal
				transparent
				visible={successOpen}
				animationType="fade"
				onRequestClose={closeAndGoBack}
			>
				<View className="flex-1 bg-black/50 items-center justify-center p-4">
					<View className="w-full max-w-[420px] bg-background rounded-xl p-4">
						<Text className="text-lg font-semibold text-center">Şifre Güncellendi</Text>
						<Text className="text-muted-foreground text-center mt-2">
							{successMessage}
						</Text>

						<AppTouchableOpacity
							className="bg-primary rounded py-2 mt-4"
							onPress={closeAndGoBack}
						>
							<Text className="text-primary-foreground text-center font-semibold">
								Hesabıma dön
							</Text>
						</AppTouchableOpacity>
					</View>
				</View>
			</Modal>

			<KeyboardAvoidingView
				className="flex-1 p-4 justify-center"
				behavior="padding"
			>
				<Card className="p-4">
					<Text className="text-xl font-semibold mb-3 text-center">Şifre Değiştir</Text>

					<View className="flex-row justify-between">
						<Text className="mt-2">Mevcut Şifre</Text>
						<AppTouchableOpacity
							className="p-1"
							onPress={() => router.push("/(tabs)/account-forgot-password")}
							hitSlop={12}
						>
							<Text
								className="text-primary"
								style={{ fontFamily: "Roboto_500Medium" }}
							>
								Şifremi unuttum
							</Text>
						</AppTouchableOpacity>
					</View>

					<Controller
						control={control}
						name="oldPassword"
						render={({ field: { onChange, onBlur, value } }) => (
							<TextInput
								className="border border-gray-300 p-2 rounded mt-1 text-foreground placeholder:text-muted-foreground"
								placeholder="Mevcut şifreniz"
								secureTextEntry
								autoCapitalize="none"
								onBlur={onBlur}
								onChangeText={onChange}
								value={value}
							/>
						)}
					/>
					{errors.oldPassword && (
						<Text className="text-red-500 mt-1 text-sm">
							{errors.oldPassword.message}
						</Text>
					)}

					<View className="h-[1px] bg-border mt-4" />

					<Text className="mt-4">Yeni Şifre</Text>
					<Controller
						control={control}
						name="newPassword"
						render={({ field: { onChange, onBlur, value } }) => (
							<TextInput
								className="border border-gray-300 p-2 rounded mt-1 text-foreground placeholder:text-muted-foreground"
								placeholder="Yeni şifre"
								secureTextEntry
								autoCapitalize="none"
								onBlur={onBlur}
								onChangeText={onChange}
								value={value}
							/>
						)}
					/>
					{errors.newPassword && (
						<Text className="text-red-500 mt-1 text-sm">
							{errors.newPassword.message}
						</Text>
					)}

					<Text className="mt-3">Yeni Şifre (Tekrar)</Text>
					<Controller
						control={control}
						name="confirmNewPassword"
						render={({ field: { onChange, onBlur, value } }) => (
							<TextInput
								className="border border-gray-300 p-2 rounded mt-1 text-foreground placeholder:text-muted-foreground"
								placeholder="Yeni şifre tekrar"
								secureTextEntry
								autoCapitalize="none"
								onBlur={onBlur}
								onChangeText={onChange}
								value={value}
							/>
						)}
					/>
					{errors.confirmNewPassword && (
						<Text className="text-red-500 mt-1 text-sm">
							{errors.confirmNewPassword.message}
						</Text>
					)}

					{serverError ? (
						<Text className="bg-destructive text-destructive-foreground p-2 rounded mt-4 text-center">
							{serverError}
						</Text>
					) : null}

					<AppTouchableOpacity
						className="bg-primary rounded py-2 mt-4 items-center disabled:bg-primary/80"
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
								"Şifreyi Güncelle"
							)}
						</Text>
					</AppTouchableOpacity>

					<AppTouchableOpacity
						className="mt-3"
						onPress={() => router.back()}
					>
						<Text className="text-primary text-center">Geri dön</Text>
					</AppTouchableOpacity>
				</Card>
			</KeyboardAvoidingView>
		</>
	);
}
