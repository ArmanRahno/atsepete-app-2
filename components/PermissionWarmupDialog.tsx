// components/PermissionWarmupDialog.tsx
import React, { createContext, useCallback, useContext, useState, ReactNode } from "react";
import { Modal, Pressable, View, Text } from "react-native";
import { X } from "lucide-react-native";
import AppTouchableOpacity from "./AppTouchableOpacity";
import { lightPrimary } from "@/constants/Colors";

type PermissionDialogMode = "request" | "settings";

export type PermissionWarmupConfig = {
	title: string;
	description: string;
	bulletPoints?: string[];
	icon?: ReactNode;
	mode?: PermissionDialogMode;
	primaryLabel?: string;
	secondaryLabel?: string;
	note?: string;
	onConfirm?: () => Promise<void> | void;
	onCancel?: () => void;
};

type PermissionDialogContextType = {
	showPermissionDialog: (config: PermissionWarmupConfig) => void;
	hidePermissionDialog: () => void;
};

const PermissionDialogContext = createContext<PermissionDialogContextType | null>(null);

export const PermissionWarmupProvider = ({ children }: { children: ReactNode }) => {
	const [config, setConfig] = useState<PermissionWarmupConfig | null>(null);
	const [visible, setVisible] = useState(false);
	const [loading, setLoading] = useState(false);

	const hidePermissionDialog = useCallback(() => {
		setVisible(false);
		setTimeout(() => setConfig(null), 200);
	}, []);

	const showPermissionDialog = useCallback((cfg: PermissionWarmupConfig) => {
		setConfig(cfg);
		setVisible(true);
	}, []);

	const handleConfirm = async () => {
		if (!config?.onConfirm || loading) {
			hidePermissionDialog();
			return;
		}

		try {
			setLoading(true);
			await config.onConfirm();
		} finally {
			setLoading(false);
			hidePermissionDialog();
		}
	};

	const handleCancel = () => {
		config?.onCancel?.();
		hidePermissionDialog();
	};

	return (
		<PermissionDialogContext.Provider value={{ showPermissionDialog, hidePermissionDialog }}>
			{children}

			<Modal
				visible={visible}
				transparent
				animationType="fade"
				onRequestClose={handleCancel}
			>
				<Pressable
					style={{
						flex: 1,
						backgroundColor: "rgba(0,0,0,0.5)",
						justifyContent: "center",
						paddingHorizontal: 24
					}}
					onPress={handleCancel}
				>
					<View
						className="rounded-3xl bg-white px-6 py-6"
						onStartShouldSetResponder={() => true}
					>
						<AppTouchableOpacity
							onPress={handleCancel}
							hitSlop={24}
							className="absolute top-4 right-4 p-1 rounded-full"
						>
							<X size={24} />
						</AppTouchableOpacity>

						{config?.icon && (
							<View className="self-center bg-primary mb-4 rounded-2xl p-4">
								{config.icon}
							</View>
						)}

						{config?.title && (
							<Text className="text-xl font-bold text-center mb-2">
								{config.title}
							</Text>
						)}

						{config?.description && (
							<Text className="text-base text-center mb-3">{config.description}</Text>
						)}

						{config?.bulletPoints?.length ? (
							<View className="mt-1 mb-4">
								{config.bulletPoints.map((point, idx) => (
									<View
										key={idx.toString()}
										className="flex-row items-start mb-1.5"
									>
										<Text className="text-base mr-2">•</Text>
										<Text className="flex-1 text-base">{point}</Text>
									</View>
								))}
							</View>
						) : null}

						{config?.note && (
							<Text className="text-xs text-center mb-3 text-red-500">
								{config.note}
							</Text>
						)}

						<View className="mt-1 gap-4">
							<AppTouchableOpacity
								disabled={loading}
								onPress={handleConfirm}
								className="w-full rounded-xl py-3 items-center justify-center"
								style={{ backgroundColor: lightPrimary }}
							>
								<Text className="font-semibold text-white">
									{config?.primaryLabel ??
										(config?.mode === "settings" ? "Ayarları Aç" : "İzin ver")}
								</Text>
							</AppTouchableOpacity>

							<AppTouchableOpacity
								disabled={loading}
								onPress={handleCancel}
								className="w-full rounded-xl py-3 items-center justify-center"
								style={{ backgroundColor: "#F2F2F2" }}
							>
								<Text className="font-semibold">
									{config?.secondaryLabel ?? "Şimdilik geç"}
								</Text>
							</AppTouchableOpacity>
						</View>
					</View>
				</Pressable>
			</Modal>
		</PermissionDialogContext.Provider>
	);
};

export const usePermissionWarmup = () => {
	const ctx = useContext(PermissionDialogContext);
	if (!ctx) {
		throw new Error("usePermissionWarmup must be used inside <PermissionWarmupProvider />");
	}
	return ctx;
};
