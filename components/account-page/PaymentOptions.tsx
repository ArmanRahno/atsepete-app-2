import React, { useCallback, useRef, useState } from "react";
import {
	View,
	Text,
	TextInput,
	Pressable,
	Modal,
	ScrollView,
	ActivityIndicator
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Payment, PaymentSchemaFrontend } from "@/zod-schemas/save-user-payment-data";
import { Copy, CopyCheck, UserRound, CreditCard, Gift, Info } from "lucide-react-native";
import FormInForm, { FormInformProps } from "../FormInform";
import {
	lightBackground,
	lightForeground,
	lightMutedForeground,
	lightSecondary,
	lightSecondaryForeground
} from "@/constants/Colors";
import USDTSvg from "../USDTSvg";
import EtheriumSvg from "../EtheriumSvg";

const BANK_TAX_POINTS = [
	"Vergilendirilmiş hesap zorunludur: Ödeme alabilmeniz için seçtiğiniz IBAN’ın vergi mükellefi bir hesaba ait olması gerekir.",
	"Vergisiz hesap riski: Vergilendirilmemiş bir IBAN kullanırsanız ileride devlet tarafından ek vergi talep edilebilir.",
	"Sorumluluk kullanıcıya aittir: Vergi yükümlülükleri kullanıcıya aittir, platform doğrudan kesinti yapmaz.",
	"Öneri: Ödemelerinizi güvenceye almak için vergiye tabi ticari/şirket hesabı kullanın."
];

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<Text className="font-semibold mb-1">{children}</Text>
);

const FieldError = ({ msg }: { msg?: string }) =>
	msg ? <Text className="text-red-500 mt-1 text-sm">{msg}</Text> : null;

const InputWithCopy = React.forwardRef<
	TextInput,
	React.ComponentProps<typeof TextInput> & { value: string }
>(({ value, ...rest }, ref) => {
	const [hasCopied, setHasCopied] = useState(false);
	return (
		<View className="flex-row items-center gap-2">
			<TextInput
				ref={ref}
				value={value}
				placeholderTextColor={lightMutedForeground}
				className="flex-1 px-3 py-3 border border-border rounded-lg"
				{...rest}
			/>
			<Pressable
				onPress={async () => {
					await Clipboard.setStringAsync(value ?? "");
					setHasCopied(true);
					setTimeout(() => setHasCopied(false), 1500);
				}}
				className="p-3 border border-border rounded-lg"
			>
				{hasCopied ? (
					<CopyCheck
						size={20}
						color="#10b981"
					/>
				) : (
					<Copy
						size={20}
						color={lightForeground}
					/>
				)}
			</Pressable>
		</View>
	);
});
InputWithCopy.displayName = "InputWithCopy";

const baseDefaults: Payment = {
	preferred_option: "banka-transferi",
	"ad-soyad": "",
	"banka-transferi": "",
	"tercih-edilen-kripto": "usdt",
	usdt: "",
	ethereum: "",
	// legacy
	kripto: "",
	"hediye-karti": ""
};

const PaymentOptions = ({ paymentData }: { paymentData?: Payment }) => {
	const [formInform, setFormInform] = useState<FormInformProps | null>(null);
	const [showTaxedBankAccountDisclaimer, setShowTaxedBankAccountDisclaimer] = useState(false);

	const defaultValues: Payment = { ...baseDefaults, ...(paymentData ?? {}) };
	const lastSaved = useRef<Payment>(defaultValues);

	const {
		control,
		handleSubmit,
		formState: { errors, dirtyFields, isDirty, isSubmitting },
		reset,
		watch,
		setValue
	} = useForm<Payment>({
		resolver: zodResolver(PaymentSchemaFrontend),
		defaultValues
	});

	const preferred = watch("preferred_option");
	const network = watch("tercih-edilen-kripto");
	const methodChanged = preferred !== lastSaved.current.preferred_option;
	const networkChanged = network !== lastSaved.current["tercih-edilen-kripto"];

	const onSubmit = useCallback(
		async (data: Payment) => {
			setFormInform(null);
			try {
				const sessionToken = await AsyncStorage.getItem("user-session-token");
				if (!sessionToken) {
					setFormInform({ status: "error", message: "Oturum bulunamadı" });
					return;
				}

				const res = await fetch(
					"https://atsepete.net/api/application/action/save-payment-data",
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ sessionToken, payment_data: data })
					}
				);

				if (!res.ok) {
					setFormInform({
						status: "error",
						message: "Bir hata oluştu. Lütfen daha sonra tekrar deneyin."
					});
					return;
				}

				const parsed: { status: "success" } | { status: "error"; message: string } =
					await res.json();

				if (parsed.status === "error") {
					setFormInform({ status: "error", message: parsed.message });
					return;
				}

				lastSaved.current = data;
				reset(data);
				setFormInform({
					status: "success",
					message: "Bilgileriniz başarıyla güncellendi."
				});
			} catch {
				setFormInform({
					status: "error",
					message: "Bir hata oluştu. Lütfen daha sonra tekrar deneyin."
				});
			} finally {
				setTimeout(() => setFormInform(null), 3000);
			}
		},
		[reset]
	);

	return (
		<View className="bg-background rounded-md mt-6 gap-4">
			<Text className="text-xl font-medium">Ödeme Yöntemleri</Text>

			<View className="p-4 border border-border rounded-lg gap-4">
				<Controller
					name="preferred_option"
					control={control}
					render={({ field }) => (
						<View>
							<Label>Tercih edilen ödeme yöntemi</Label>
							<View
								className="rounded-lg border border-border overflow-hidden"
								style={{ backgroundColor: lightSecondary }}
							>
								<Picker
									selectedValue={field.value}
									enabled={!isSubmitting}
									onValueChange={val => {
										setValue(
											"preferred_option",
											val as Payment["preferred_option"],
											{
												shouldDirty: true,
												shouldTouch: true,
												shouldValidate: true
											}
										);

										if (val === "banka-transferi") {
											if (dirtyFields?.usdt || errors?.usdt)
												setValue("usdt", "", { shouldDirty: true });
											if (dirtyFields?.ethereum || errors?.ethereum)
												setValue("ethereum", "", { shouldDirty: true });
										} else if (val === "kripto") {
											if (
												dirtyFields?.["banka-transferi"] ||
												errors?.["banka-transferi"]
											) {
												setValue("banka-transferi", "", {
													shouldDirty: true
												});
											}
										}
									}}
									style={{
										color: lightSecondaryForeground,
										backgroundColor: lightBackground
									}}
									dropdownIconColor={lightSecondaryForeground}
								>
									<Picker.Item
										label="Banka Transferi"
										value="banka-transferi"
									/>
									<Picker.Item
										label="Kripto"
										value="kripto"
									/>
									<Picker.Item
										label="Hediye Kartı"
										value="hediye-karti"
									/>
								</Picker>
							</View>
							<FieldError
								msg={errors.preferred_option?.message as string | undefined}
							/>
						</View>
					)}
				/>

				{preferred === "banka-transferi" && (
					<>
						<Controller
							name="ad-soyad"
							control={control}
							render={({ field }) => (
								<View>
									<View className="flex-row items-center gap-1">
										<UserRound size={16} />
										<Label>Ad Soyad</Label>
									</View>
									<InputWithCopy
										value={field.value ?? ""}
										placeholder="Ad Soyad"
										editable={!isSubmitting}
										onChangeText={field.onChange}
									/>
									<FieldError
										msg={errors["ad-soyad"]?.message as string | undefined}
									/>
								</View>
							)}
						/>

						<Controller
							name="banka-transferi"
							control={control}
							render={({ field }) => (
								<View>
									<View className="flex-row items-center gap-1">
										<CreditCard size={16} />
										<Label>IBAN Adresi</Label>
									</View>
									<InputWithCopy
										value={field.value ?? ""}
										placeholder="IBAN Adresiniz"
										editable={!isSubmitting}
										onChangeText={field.onChange}
									/>
									<FieldError
										msg={
											errors["banka-transferi"]?.message as string | undefined
										}
									/>
								</View>
							)}
						/>

						<View>
							<Pressable
								onPress={() => setShowTaxedBankAccountDisclaimer(true)}
								className="self-start mb-1"
							>
								<Text
									className="text-sm text-blue-600 underline"
									style={{ fontFamily: "Roboto_700Bold" }}
								>
									Banka hesabınızın vergilendirilmiş olması zorunludur.
								</Text>
							</Pressable>
						</View>
					</>
				)}

				{preferred === "kripto" && (
					<>
						<View className="border border-border rounded-lg overflow-hidden flex-row">
							{[
								{ key: "usdt" as const, label: "USDT", Icon: USDTSvg },
								{
									key: "ethereum" as const,
									label: "Ethereum",
									Icon: EtheriumSvg
								}
							].map((opt, idx) => {
								const selected = network === opt.key;

								return (
									<Pressable
										key={opt.key}
										onPress={() => {
											if (network !== opt.key) {
												setValue("tercih-edilen-kripto", opt.key, {
													shouldDirty: true,
													shouldTouch: true,
													shouldValidate: true
												});
											}
										}}
										className={`flex-1 items-center justify-center px-4 py-2 ${
											selected ? "bg-background" : "bg-muted"
										}`}
										style={{
											borderLeftWidth: idx === 1 ? 1 : 0,
											borderLeftColor: "#E5E7EB"
										}}
									>
										<View className="flex-row items-center justify-center gap-2">
											<opt.Icon />
											<Text
												className="text-base"
												style={{ fontFamily: "Roboto_700Bold" }}
											>
												{opt.label}
											</Text>
										</View>
									</Pressable>
								);
							})}
						</View>

						{network === "usdt" && (
							<Controller
								name="usdt"
								control={control}
								render={({ field }) => (
									<View>
										<Label>USDT (TRC20) Adresi</Label>
										<InputWithCopy
											value={field.value ?? ""}
											placeholder="TRON: T..."
											editable={!isSubmitting}
											onChangeText={field.onChange}
										/>
										<FieldError
											msg={errors.usdt?.message as string | undefined}
										/>
									</View>
								)}
							/>
						)}

						{network === "ethereum" && (
							<Controller
								name="ethereum"
								control={control}
								render={({ field }) => (
									<View>
										<Label>Ethereum (ERC20) Adresi</Label>
										<InputWithCopy
											value={field.value ?? ""}
											placeholder="ETH: 0x..."
											editable={!isSubmitting}
											onChangeText={field.onChange}
										/>
										<FieldError
											msg={errors.ethereum?.message as string | undefined}
										/>
									</View>
								)}
							/>
						)}
					</>
				)}

				{preferred === "hediye-karti" && (
					<View className="px-2">
						<Text
							className="text-base font-medium mb-2"
							style={{ fontFamily: "Roboto_500Medium" }}
						>
							Hediye Kartı Nedir?
						</Text>

						<Text className="text-sm">
							Hediye kartı seçeneği için ekstra herhangi bir şey yapmanıza gerek
							yoktur. Kazançlarınız yeterli olup para çekmek istediğinizde email
							hesabınıza hediye kartı kodu gönderilecektir.
						</Text>
					</View>
				)}

				{formInform && (
					<FormInForm
						status={formInform.status}
						message={formInform.message}
					/>
				)}

				<View className="flex-row gap-2">
					<Pressable
						disabled={isSubmitting || (!isDirty && !methodChanged && !networkChanged)}
						onPress={() => reset(lastSaved.current)}
						className={`flex-1 py-3 rounded-lg items-center bg-secondary ${
							isSubmitting || (!isDirty && !methodChanged && !networkChanged)
								? "opacity-40"
								: ""
						}`}
					>
						<Text
							className="text-secondary-foreground"
							style={{ fontFamily: "Roboto_500Medium" }}
						>
							Değişiklikleri Geri Al
						</Text>
					</Pressable>

					<Pressable
						disabled={isSubmitting || (!isDirty && !methodChanged && !networkChanged)}
						onPress={handleSubmit(onSubmit)}
						className={`flex-1 py-3 rounded-lg bg-primary items-center ${
							isSubmitting || (!isDirty && !methodChanged && !networkChanged)
								? "opacity-40"
								: ""
						}`}
					>
						{isSubmitting ? (
							<ActivityIndicator
								size={16}
								color="#fff"
							/>
						) : (
							<Text
								className="text-primary-foreground"
								style={{ fontFamily: "Roboto_500Medium" }}
							>
								Kaydet
							</Text>
						)}
					</Pressable>
				</View>

				<Modal
					visible={showTaxedBankAccountDisclaimer}
					transparent
					animationType="fade"
					onRequestClose={() => setShowTaxedBankAccountDisclaimer(false)}
				>
					<Pressable
						className="flex-1 bg-black/50 justify-end"
						onPress={() => setShowTaxedBankAccountDisclaimer(false)}
					>
						<Pressable className="bg-background p-6 rounded-t-2xl">
							<Text className="text-lg font-bold mb-2">
								IBAN Seçimi ve Vergilendirme Uyarıları
							</Text>
							<ScrollView>
								{BANK_TAX_POINTS.map((t, i) => (
									<Text
										key={i}
										className="text-sm mb-2"
									>
										{"\u2022"} {t}
									</Text>
								))}
							</ScrollView>
							<Pressable
								onPress={() => setShowTaxedBankAccountDisclaimer(false)}
								className="py-3 rounded-lg items-center bg-secondary mt-4"
							>
								<Text className="text-secondary-foreground">Geri Dön</Text>
							</Pressable>
						</Pressable>
					</Pressable>
				</Modal>
			</View>
		</View>
	);
};

export default PaymentOptions;
