import React, { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import z from "zod";
import { router } from "expo-router";

const ReportBugSchema = z.object({
	email: z.string().email("Hatalı email."),
	description: z.string().min(1, "Açıklama zorunludur."),
	steps_to_reproduce_issue: z.string().min(1, "Sorunun nasıl oluştuğu alanı zorunludur."),
	screenshots: z.array(z.string()).max(1, "1'den fazla ekran görüntüsü gönderilemez.").optional(),
	type: z.enum(["WEB", "APP"])
});

type ReportBug = z.infer<typeof ReportBugSchema>;

type ReportBugFormProps = {};

const API_URL = "https://atsepete.net/api/application/action/report-bug";

export default function ReportBugForm({}: ReportBugFormProps) {
	const [isPending, setIsPending] = useState(false);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitSuccessful }
	} = useForm<ReportBug>({
		resolver: zodResolver(ReportBugSchema),
		defaultValues: {
			email: "",
			description: "",
			steps_to_reproduce_issue: "",
			screenshots: [],
			type: "APP"
		}
	});

	async function pickScreenshot(
		currentScreenshots: string[],
		onChange: (newVal: string[]) => void
	) {
		const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (!permissionResult.granted) {
			Alert.alert("İzin Gerekli", "Lütfen galeriye erişime izin verin.");
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			allowsMultipleSelection: false,
			base64: true,
			quality: 1
		});

		if (!result.canceled && result.assets?.[0]) {
			const picked = result.assets[0];
			if (picked.base64) {
				const sizeInBytes = (picked.base64.length * 3) / 4;
				if (sizeInBytes > 2 * 1024 * 1024) {
					Alert.alert("Resim Çok Büyük", "2 MB limitini aşıyor!");
					return;
				}
			}

			const updated = [...currentScreenshots, picked.base64 || ""];
			onChange(updated);
		}
	}

	const onSubmit = async (values: ReportBug) => {
		setIsPending(true);

		try {
			const result = await fetch(API_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(values)
			});

			if (!result.ok) Alert.alert("Bir hata oluştu.");

			const body = await result.json();

			if (body?.status === "success") {
				Alert.alert("Başarılı", body?.message || "Hata bildirildi.");
				reset();
			} else {
				Alert.alert("Hata", body?.message || "Bir hata oluştu.");
			}
		} catch (error) {
			console.error("Error reporting bug:", error);
			Alert.alert("Hata", "Bir hata oluştu.");
		}
		setIsPending(false);
	};

	return (
		<View className="flex-1 bg-secondary justify-center items-center">
			<View className="w-4/5 max-w-96 bg-background border border-border shadow-lg p-5 rounded-lg gap-4">
				<Text className="text-lg text-foreground font-semibold">Hata Bildir</Text>

				<View className="gap-1">
					<Text className="font-medium">
						Email Adresi <Text className="text-destructive">*</Text>
					</Text>
					<Controller
						name="email"
						control={control}
						render={({ field }) => (
							<TextInput
								className="rounded-lg px-4 py-2 border border-border text-foreground placeholder:text-muted-foreground"
								placeholder="john-doe@gmail.com"
								keyboardType="email-address"
								autoCapitalize="none"
								autoCorrect={false}
								onChangeText={field.onChange}
								value={field.value}
								editable={!isPending}
							/>
						)}
					/>
					{errors.email && (
						<Text className="text-red-500 text-sm">{errors.email.message}</Text>
					)}
				</View>

				<View className="gap-1">
					<Text className="font-medium">
						Açıklama <Text className="text-destructive">*</Text>
					</Text>
					<Controller
						name="description"
						control={control}
						render={({ field }) => (
							<TextInput
								className="rounded-lg px-4 py-2 border border-border text-foreground placeholder:text-muted-foreground"
								placeholder="Sorunun açıklaması"
								onChangeText={field.onChange}
								value={field.value}
								editable={!isPending}
							/>
						)}
					/>
					{errors.description && (
						<Text className="text-red-500 text-sm">{errors.description.message}</Text>
					)}
				</View>

				<View className="gap-1">
					<Text className="font-medium">
						Sorunun Oluşma Adımları <Text className="text-destructive">*</Text>
					</Text>
					<Controller
						name="steps_to_reproduce_issue"
						control={control}
						render={({ field }) => (
							<TextInput
								multiline
								className="text-sm rounded-lg px-4 py-2 border border-border text-foreground placeholder:text-muted-foreground"
								placeholder="Sorunun nasıl oluştuğunu adım adım anlatın..."
								onChangeText={field.onChange}
								value={field.value}
								editable={!isPending}
							/>
						)}
					/>
					{errors.steps_to_reproduce_issue && (
						<Text className="text-red-500 text-sm">
							{errors.steps_to_reproduce_issue.message}
						</Text>
					)}
				</View>

				<View className="gap-1">
					<Text className="font-medium">Ekran Görüntüsü (Max. 2 MB)</Text>
					<Controller
						name="screenshots"
						control={control}
						render={({ field }) => (
							<>
								<TouchableOpacity
									className="rounded-lg px-4 py-2 border border-border flex-row justify-between"
									disabled={isPending}
									onPress={() =>
										field.value && pickScreenshot(field.value, field.onChange)
									}
								>
									<Text className="text-sm">
										{field.value?.length
											? `Seçilen Ekran Görüntüleri: ${field.value.length}`
											: "Ekran Görüntüsü Seç"}
									</Text>
								</TouchableOpacity>
								{errors.screenshots && (
									<Text className="text-red-500 text-sm">
										{errors.screenshots.message}
									</Text>
								)}
							</>
						)}
					/>
				</View>

				<View className="gap-2">
					{!isSubmitSuccessful && (
						<TouchableOpacity
							className="flex-row justify-center items-center gap-1 px-4 py-2 bg-primary rounded-lg"
							onPress={handleSubmit(onSubmit)}
							disabled={isPending}
						>
							{isPending ? (
								<ActivityIndicator color="#fff" />
							) : (
								<>
									<Text className="text-sm font-medium text-primary-foreground">
										Gönder
									</Text>
								</>
							)}
						</TouchableOpacity>
					)}

					<TouchableOpacity
						className="flex-row justify-center items-center gap-1 px-4 py-2 bg-secondary rounded-lg"
						onPress={() => router.back()}
						disabled={isPending}
					>
						<Text className="text-sm font-medium text-secondary-foreground">
							Geri Dön
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}
