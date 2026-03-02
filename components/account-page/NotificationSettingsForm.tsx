import React, { useMemo, useState, useCallback } from "react";
import {
	View,
	Text,
	Switch,
	StyleSheet,
	Platform,
	Modal,
	Pressable,
	FlatList,
	Dimensions
} from "react-native";
import { lightBackground, lightBorder, lightForeground, lightPrimary } from "@/constants/Colors";
import { NotificationChannelSettingsSchema } from "@/zod-schemas/notification-settings";
import AppTouchableOpacity from "@/components/AppTouchableOpacity";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronDown } from "lucide-react-native";

type NotificationChannelSettings = {
	enabled: boolean;
	discounts_enabled: boolean;
	discount_min_percent: number;
	frequency: "instant" | "daily";
	daily_hour: number;
	send_window_enabled: boolean;
	send_window_start_hour: number;
	send_window_end_hour: number;
};

type Option<T> = { label: string; value: T };

const Hours = Array.from({ length: 24 }).map((_, i) => i);

const PercentOptions: Option<number>[] = [
	{ label: "Tüm indirimler", value: 0 },
	{ label: "%10 ve üzeri", value: 10 },
	{ label: "%20 ve üzeri", value: 20 },
	{ label: "%30 ve üzeri", value: 30 },
	{ label: "%40 ve üzeri", value: 40 }
];

const FrequencyOptions: Option<"instant" | "daily">[] = [
	{ label: "Anında", value: "instant" },
	{ label: "Günde 1", value: "daily" }
];

const HourOptions: Option<number>[] = Hours.map(h => ({
	label: `${String(h).padStart(2, "0")}:00`,
	value: h
}));

const getLabel = <T,>(options: Option<T>[], value: T) => {
	const found = options.find(o => o.value === value);
	return found?.label ?? "";
};

function ThemedSwitch({
	value,
	onValueChange,
	disabled
}: {
	value: boolean;
	onValueChange: (v: boolean) => void;
	disabled?: boolean;
}) {
	return (
		<Switch
			value={value}
			onValueChange={onValueChange}
			disabled={disabled}
			trackColor={{ false: lightBorder, true: lightPrimary }}
			ios_backgroundColor={lightBorder}
			thumbColor={Platform.OS === "android" ? "#fff" : undefined}
		/>
	);
}

function Section({
	title,
	description,
	right,
	children,
	disabled
}: {
	title: string;
	description?: string;
	right?: React.ReactNode;
	children?: React.ReactNode;
	disabled?: boolean;
}) {
	return (
		<View
			className={`rounded-xl border border-border bg-background p-4 ${
				disabled ? "opacity-60" : ""
			}`}
			pointerEvents={disabled ? "none" : "auto"}
		>
			<View className="flex-row items-start justify-between gap-3">
				<View className="flex-1 pr-2">
					<Text className="text-foreground font-semibold">{title}</Text>
					{description ? (
						<Text className="text-muted-foreground text-xs mt-1 leading-4">
							{description}
						</Text>
					) : null}
				</View>
				{right}
			</View>

			{children ? <View className="mt-4">{children}</View> : null}
		</View>
	);
}

function FieldLabel({ children }: { children: React.ReactNode }) {
	return <Text className="text-muted-foreground text-xs mb-1">{children}</Text>;
}

function PickerSheet<T>({
	visible,
	title,
	options,
	value,
	onClose,
	onSelect
}: {
	visible: boolean;
	title: string;
	options: Option<T>[];
	value: T;
	onClose: () => void;
	onSelect: (v: T) => void;
}) {
	const screenH = Dimensions.get("window").height;
	const maxSheetH = Math.min(520, Math.max(260, Math.floor(screenH * 0.6)));

	const insets = useSafeAreaInsets();

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}
		>
			<Pressable
				style={styles.overlay}
				onPress={onClose}
			/>

			<View style={[styles.sheet, { maxHeight: maxSheetH, bottom: insets.bottom + 12 }]}>
				<View style={styles.sheetHeader}>
					<Text style={styles.sheetTitle}>{title}</Text>
					<AppTouchableOpacity
						onPress={onClose}
						hitSlop={12}
						className="px-2 py-1 rounded-md"
					>
						<Text style={styles.sheetClose}>Kapat</Text>
					</AppTouchableOpacity>
				</View>

				<View style={styles.sheetDivider} />

				<FlatList
					data={options}
					keyExtractor={(_, idx) => String(idx)}
					contentContainerStyle={{ paddingVertical: 6 }}
					style={{ flexGrow: 0 }}
					renderItem={({ item }) => {
						const selected = item.value === value;
						return (
							<AppTouchableOpacity
								onPress={() => {
									onSelect(item.value);
									onClose();
								}}
								className="px-4 py-3"
								style={[
									styles.optionRow,
									selected ? styles.optionRowSelected : null
								]}
							>
								<Text
									style={[
										styles.optionText,
										selected ? styles.optionTextSelected : null
									]}
								>
									{item.label}
								</Text>
								{selected ? <Text style={styles.check}>✓</Text> : null}
							</AppTouchableOpacity>
						);
					}}
					ItemSeparatorComponent={() => <View style={styles.optionDivider} />}
				/>
				<View style={{ height: 12 }} />
			</View>
		</Modal>
	);
}

export default function NotificationSettingsForm({
	value,
	onChange,
	disabled
}: {
	value?: NotificationChannelSettings | null;
	onChange: (patch: Partial<NotificationChannelSettings>) => void;
	disabled?: boolean;
}) {
	const safeValue = useMemo<NotificationChannelSettings>(() => {
		const parsed = NotificationChannelSettingsSchema.safeParse(value ?? {});
		return parsed.success
			? (parsed.data as any)
			: (NotificationChannelSettingsSchema.parse({}) as any);
	}, [value]);

	const [open, setOpen] = useState<
		null | "percent" | "freq" | "dailyHour" | "startHour" | "endHour"
	>(null);

	const enabled = Boolean(safeValue.enabled);
	const discountsEnabled = Boolean(safeValue.discounts_enabled);
	const sendWindowEnabled = Boolean(safeValue.send_window_enabled);
	const frequency = safeValue.frequency === "daily" ? "daily" : "instant";

	const wrapDisabled = Boolean(disabled) || !enabled;

	const openIf = useCallback(
		(key: NonNullable<typeof open>) => {
			if (disabled) return;
			setOpen(key);
		},
		[disabled]
	);

	return (
		<View className="gap-4">
			<Section
				title="Bildirimler"
				description="Bu kanal için bildirimleri açıp kapatın."
				right={
					<ThemedSwitch
						value={enabled}
						onValueChange={v => onChange({ enabled: v })}
						disabled={disabled}
					/>
				}
			/>

			<Section
				title="İndirim Bildirimleri"
				description="İndirim olduğunda bildir."
				disabled={wrapDisabled}
				right={
					<ThemedSwitch
						value={discountsEnabled}
						onValueChange={v => onChange({ discounts_enabled: v })}
						disabled={disabled}
					/>
				}
			>
				<View
					className={discountsEnabled ? "" : "opacity-60"}
					pointerEvents={discountsEnabled ? "auto" : "none"}
				>
					<FieldLabel>Minimum indirim Oranı</FieldLabel>
					<AppTouchableOpacity
						style={styles.trigger}
						onPress={() => openIf("percent")}
					>
						<View style={styles.triggerInner}>
							<Text
								style={styles.triggerText}
								numberOfLines={1}
								ellipsizeMode="tail"
							>
								{getLabel(
									PercentOptions,
									Number(safeValue.discount_min_percent ?? 0)
								)}
							</Text>
							<ChevronDown
								size={18}
								color={lightForeground}
								style={styles.chevron}
							/>
						</View>
					</AppTouchableOpacity>
				</View>
			</Section>

			<Section
				title="Gönderim"
				description="Ne sıklıkla bildirim alacağınızı seçin."
				disabled={wrapDisabled}
			>
				<FieldLabel>Sıklık</FieldLabel>
				<AppTouchableOpacity
					style={styles.trigger}
					onPress={() => openIf("freq")}
				>
					<View style={styles.triggerInner}>
						<Text
							style={styles.triggerText}
							numberOfLines={1}
							ellipsizeMode="tail"
						>
							{getLabel(FrequencyOptions, frequency)}
						</Text>
						<ChevronDown
							size={18}
							color={lightForeground}
							style={styles.chevron}
						/>
					</View>
				</AppTouchableOpacity>

				<View
					className={`mt-3 ${frequency === "daily" ? "" : "opacity-60"}`}
					pointerEvents={frequency === "daily" ? "auto" : "none"}
				>
					<FieldLabel>Günlük saat</FieldLabel>
					<AppTouchableOpacity
						style={styles.trigger}
						onPress={() => openIf("dailyHour")}
					>
						<View style={styles.triggerInner}>
							<Text
								style={styles.triggerText}
								numberOfLines={1}
								ellipsizeMode="tail"
							>
								{getLabel(HourOptions, Number(safeValue.daily_hour ?? 9))}
							</Text>
							<ChevronDown
								size={18}
								color={lightForeground}
								style={styles.chevron}
							/>
						</View>
					</AppTouchableOpacity>
				</View>
			</Section>

			<Section
				title="Gönderim Saat Aralığı"
				description="Sadece belirlediğiniz saatlerde gönder."
				disabled={wrapDisabled}
				right={
					<ThemedSwitch
						value={sendWindowEnabled}
						onValueChange={v => onChange({ send_window_enabled: v })}
						disabled={disabled}
					/>
				}
			>
				<View
					className={`gap-3 ${sendWindowEnabled ? "" : "opacity-60"}`}
					pointerEvents={sendWindowEnabled ? "auto" : "none"}
				>
					<View>
						<FieldLabel>Başlangıç</FieldLabel>
						<AppTouchableOpacity
							style={styles.trigger}
							onPress={() => openIf("startHour")}
						>
							<View style={styles.triggerInner}>
								<Text
									style={styles.triggerText}
									numberOfLines={1}
									ellipsizeMode="tail"
								>
									{getLabel(
										HourOptions,
										Number(safeValue.send_window_start_hour ?? 9)
									)}
								</Text>
								<ChevronDown
									size={18}
									color={lightForeground}
									style={styles.chevron}
								/>
							</View>
						</AppTouchableOpacity>
					</View>

					<View>
						<FieldLabel>Bitiş</FieldLabel>
						<AppTouchableOpacity
							style={styles.trigger}
							onPress={() => openIf("endHour")}
						>
							<View style={styles.triggerInner}>
								<Text
									style={styles.triggerText}
									numberOfLines={1}
									ellipsizeMode="tail"
								>
									{getLabel(
										HourOptions,
										Number(safeValue.send_window_end_hour ?? 22)
									)}
								</Text>
								<ChevronDown
									size={18}
									color={lightForeground}
									style={styles.chevron}
								/>
							</View>
						</AppTouchableOpacity>
					</View>
				</View>
			</Section>

			<PickerSheet
				visible={open === "percent"}
				title="Minimum indirim"
				options={PercentOptions}
				value={Number(safeValue.discount_min_percent ?? 0)}
				onClose={() => setOpen(null)}
				onSelect={v => onChange({ discount_min_percent: Number(v) })}
			/>

			<PickerSheet
				visible={open === "freq"}
				title="Sıklık"
				options={FrequencyOptions}
				value={frequency}
				onClose={() => setOpen(null)}
				onSelect={v =>
					onChange({
						frequency: v as NotificationChannelSettings["frequency"] | undefined
					})
				}
			/>

			<PickerSheet
				visible={open === "dailyHour"}
				title="Günlük saat"
				options={HourOptions}
				value={Number(safeValue.daily_hour ?? 9)}
				onClose={() => setOpen(null)}
				onSelect={v => onChange({ daily_hour: Number(v) })}
			/>

			<PickerSheet
				visible={open === "startHour"}
				title="Başlangıç saati"
				options={HourOptions}
				value={Number(safeValue.send_window_start_hour ?? 9)}
				onClose={() => setOpen(null)}
				onSelect={v => onChange({ send_window_start_hour: Number(v) })}
			/>

			<PickerSheet
				visible={open === "endHour"}
				title="Bitiş saati"
				options={HourOptions}
				value={Number(safeValue.send_window_end_hour ?? 22)}
				onClose={() => setOpen(null)}
				onSelect={v => onChange({ send_window_end_hour: Number(v) })}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	overlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0,0,0,0.35)"
	},
	sheet: {
		position: "absolute",
		left: 12,
		right: 12,
		backgroundColor: lightBackground,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: lightBorder,
		overflow: "hidden"
	},
	sheetHeader: {
		paddingHorizontal: 14,
		paddingVertical: 12,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between"
	},
	sheetTitle: {
		color: lightForeground,
		fontSize: 15,
		fontWeight: "700"
	},
	sheetClose: {
		color: lightForeground,
		fontSize: 14,
		fontWeight: "600",
		opacity: 0.8
	},
	sheetDivider: {
		height: 1,
		backgroundColor: lightBorder
	},
	optionRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between"
	},
	optionRowSelected: {
		backgroundColor: "rgba(0,0,0,0.03)"
	},
	optionText: {
		color: lightForeground,
		fontSize: 14,
		fontWeight: "600"
	},
	optionTextSelected: {
		color: lightForeground
	},
	check: {
		color: lightPrimary,
		fontSize: 16,
		fontWeight: "800"
	},
	optionDivider: {
		height: 1,
		backgroundColor: "rgba(0,0,0,0.04)"
	},

	trigger: {
		backgroundColor: lightBackground,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: lightBorder,
		paddingHorizontal: 12,
		paddingVertical: 10,
		minHeight: 44,
		justifyContent: "center"
	},
	triggerInner: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 10
	},
	triggerText: {
		color: lightForeground,
		fontSize: 14,
		fontWeight: "600",
		flex: 1
	},
	chevron: {
		opacity: 0.7
	}
});
