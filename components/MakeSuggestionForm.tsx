import React, { useState } from "react";
import {
	Text,
	View,
	TextInput,
	Alert,
	ActivityIndicator,
	KeyboardAvoidingView
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { router } from "expo-router";
import AppTouchableOpacity from "./AppTouchableOpacity";

const MakeSuggestionSchema = z.object({
	email: z.string().email("Hatalı email."),
	title: z.string().max(200, "Başlık maksimum 200 harf olabilir."),
	description: z.string().min(1, "Açıklama zorunludur."),
	screenshots: z.array(z.string()).max(1, "1'den fazla ekran görüntüsü gönderilemez.").optional(),
	type: z.enum(["WEB", "APP"])
});

type MakeSuggestion = z.infer<typeof MakeSuggestionSchema>;

type MakeSuggestionFormProps = {};

const API_URL = "https://atsepete.net/api/application/action/user-suggestion";

export default function MakeSuggestionForm({}: MakeSuggestionFormProps) {
	const [isPending, setIsPending] = useState(false);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitSuccessful }
	} = useForm<MakeSuggestion>({
		resolver: zodResolver(MakeSuggestionSchema),
		defaultValues: {
			email: "",
			description: "",
			title: "",
			screenshots: [],
			type: "APP"
		}
	});

	const onSubmit = async (values: MakeSuggestion) => {
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
				Alert.alert("Başarılı", body?.message || "Öneriniz için teşekkür ederiz!");
				reset();
			} else {
				Alert.alert("Hata", body?.message || "Bir hata oluştu.");
			}
		} catch (error) {
			console.error("Error submitting suggestion:", error);
			Alert.alert("Hata", "Bir hata oluştu.");
		}
		setIsPending(false);
	};

	return (
		<KeyboardAvoidingView
			className="flex-1 bg-secondary justify-center items-center"
			behavior="padding"
		>
			<View className="w-4/5 max-w-96 bg-background border border-border shadow-lg p-5 rounded-lg gap-4">
				<Text className="text-lg text-foreground font-semibold">Öneri Yap</Text>

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
					<Text className="font-medium">Başlık</Text>
					<Controller
						name="title"
						control={control}
						render={({ field }) => (
							<TextInput
								className="rounded-lg px-4 py-2 border border-border text-foreground placeholder:text-muted-foreground"
								placeholder="Önerinizin başlığı"
								onChangeText={field.onChange}
								value={field.value}
								editable={!isPending}
							/>
						)}
					/>
					{errors.title && (
						<Text className="text-red-500 text-sm">{errors.title.message}</Text>
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
								multiline
								className="text-sm rounded-lg px-4 py-2 border border-border text-foreground placeholder:text-muted-foreground"
								placeholder="Önerinizin detaylı açıklaması"
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

				<View className="gap-2">
					{!isSubmitSuccessful && (
						<AppTouchableOpacity
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
						</AppTouchableOpacity>
					)}

					<AppTouchableOpacity
						className="flex-row justify-center items-center gap-1 px-4 py-2 bg-secondary rounded-lg"
						onPress={() => router.back()}
						disabled={isPending}
					>
						<Text className="text-sm font-medium text-secondary-foreground">
							Geri Dön
						</Text>
					</AppTouchableOpacity>
				</View>
			</View>
		</KeyboardAvoidingView>
	);
}
