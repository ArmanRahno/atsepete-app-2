import React, { useMemo, useState } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useThemePalette } from "@/hooks/useThemePalette";

type Option<T extends string | number> = {
	label: string;
	value: T;
};

export default function PickerField<T extends string | number>({
	label,
	value,
	onChange,
	options,
	disabled
}: {
	label?: string;
	value: T;
	onChange: (v: T) => void;
	options: Option<T>[];
	disabled?: boolean;
}) {
	const [open, setOpen] = useState(false);
	const { colors } = useThemePalette();

	const selectedLabel = useMemo(() => {
		const found = options.find(o => o.value === value);
		return found?.label ?? String(value);
	}, [options, value]);

	return (
		<View>
			{label ? <Text className="text-muted-foreground text-xs mb-1">{label}</Text> : null}

			<Pressable
				disabled={disabled}
				onPress={() => setOpen(true)}
				style={({ pressed }) => [
					{
						backgroundColor: colors.background,
						borderRadius: 10,
						borderWidth: 1,
						borderColor: colors.border,
						paddingHorizontal: 12,
						paddingVertical: 12,
						minHeight: 44,
						opacity: disabled ? 0.6 : pressed ? 0.9 : 1,
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-between"
					}
				]}
			>
				<Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}>
					{selectedLabel}
				</Text>
				<Text style={{ color: colors.text, opacity: 0.55, fontSize: 16 }}>▾</Text>
			</Pressable>

			<Modal
				visible={open}
				transparent
				animationType="fade"
				onRequestClose={() => setOpen(false)}
			>
				<Pressable
					style={{
						flex: 1,
						backgroundColor: "rgba(0,0,0,0.35)",
						justifyContent: "flex-end"
					}}
					onPress={() => setOpen(false)}
				/>

				<View
					style={{
						backgroundColor: colors.background,
						borderTopLeftRadius: 16,
						borderTopRightRadius: 16,
						borderTopWidth: 1,
						borderColor: colors.border,
						paddingBottom: Platform.OS === "ios" ? 24 : 12
					}}
				>
					<View
						style={{
							paddingHorizontal: 14,
							paddingVertical: 12,
							flexDirection: "row",
							alignItems: "center",
							justifyContent: "space-between",
							borderBottomWidth: 1,
							borderColor: colors.border
						}}
					>
						<Text style={{ color: colors.text, fontSize: 14, fontWeight: "700" }}>
							{label ?? "Seç"}
						</Text>

						<Pressable
							onPress={() => setOpen(false)}
							style={({ pressed }) => ({
								paddingHorizontal: 12,
								paddingVertical: 8,
								borderRadius: 10,
								backgroundColor: pressed ? colors.secondary : "transparent"
							})}
						>
							<Text style={{ color: colors.primary, fontWeight: "800" }}>Tamam</Text>
						</Pressable>
					</View>

					<Picker
						selectedValue={value}
						onValueChange={v => onChange(v as T)}
						style={{ color: colors.text }}
						dropdownIconColor={colors.text}
					>
						{options.map(o => (
							<Picker.Item
								key={String(o.value)}
								label={o.label}
								value={o.value}
							/>
						))}
					</Picker>
				</View>
			</Modal>
		</View>
	);
}
