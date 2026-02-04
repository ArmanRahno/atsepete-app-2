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

const ForgotSchema = z.object({
	email: z.string().email("Geçerli bir e-posta giriniz.")
});

type ForgotValues = z.infer<typeof ForgotSchema>;

type ForgotRes =
	| { status: "success"; message: string }
	| { status: "error"; message: string; code?: string };

const ENDPOINT = "https://atsepete.net/api/application/auth/password-reset/request";

export default function ForgotPasswordScreen() {
	const router = useRouter();

	const [serverError, setServerError] = useState<string>("");
	const [successOpen, setSuccessOpen] = useState(false);
	const [successMessage, setSuccessMessage] = useState("");

	const form = useForm<ForgotValues>({
		resolver: zodResolver(ForgotSchema),
		defaultValues: { email: "" }
	});

	const {
		handleSubmit,
		control,
		formState: { errors, isSubmitting }
	} = form;

	const closeAndGoBack = () => {
		setSuccessOpen(false);
		router.back();
	};

	const onSubmit = async (values: ForgotValues) => {
		try {
			setServerError("");

			const r = await fetch(ENDPOINT, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: values.email }),
				credentials: "include"
			});

			const res = (await r.json().catch(() => null)) as ForgotRes | null;

			if (r.ok && res?.status === "success") {
				setSuccessMessage(
					res.message || "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi."
				);
				setSuccessOpen(true);
				form.reset({ email: "" });
				return;
			}

			setServerError(res?.message || "İşlem sırasında bir hata oluştu.");
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
						<Text className="text-lg font-semibold text-center">Başarılı</Text>

						<Text className="text-muted-foreground text-center mt-2">
							{successMessage}
						</Text>

						<AppTouchableOpacity
							className="bg-primary rounded py-2 mt-4"
							onPress={closeAndGoBack}
						>
							<Text className="text-primary-foreground text-center font-semibold">
								Giriş ekranına dön
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
					<Text className="text-xl font-semibold mb-3 text-center">Şifremi Unuttum</Text>

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
						<Text className="text-red-500 mt-1 text-sm">{errors.email.message}</Text>
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
								"Link Gönder"
							)}
						</Text>
					</AppTouchableOpacity>

					<AppTouchableOpacity
						className="mt-4"
						onPress={() => router.back()}
					>
						<Text className="text-primary text-center">Geri dön</Text>
					</AppTouchableOpacity>
				</Card>
			</KeyboardAvoidingView>
		</>
	);
}
