import { lightMutedForeground } from "@/constants/Colors";
import { Camera as CameraIcon } from "lucide-react-native";
import { AppState, Text, View } from "react-native";
import { useEffect, useRef, useState } from "react";
import BarcodeScanCameraModal from "./BarcodeScanCameraModal";
import { usePermissionWarmup } from "../PermissionWarmupDialog";
import { openSettings } from "expo-linking";
import AppTouchableOpacity from "../AppTouchableOpacity";
import { Camera } from "expo-camera";

const BarcodeScanButton = () => {
	const [isCamViewOpen, setIsCamViewOpen] = useState<boolean>(false);

	const [pendingCamOpenAfterSettings, setPendingCamOpenAfterSettings] = useState(false);
	const appState = useRef(AppState.currentState);

	const { showPermissionDialog } = usePermissionWarmup();

	useEffect(() => {
		const subscription = AppState.addEventListener("change", async nextState => {
			// Runs when app state changes to foreground.
			if (
				appState.current.match(/inactive|background/) &&
				nextState === "active" &&
				pendingCamOpenAfterSettings
			) {
				const perm = await Camera.getCameraPermissionsAsync();

				if (perm.granted) {
					setIsCamViewOpen(true);
				}

				setPendingCamOpenAfterSettings(false);
			}

			appState.current = nextState;
		});

		return () => {
			subscription.remove();
		};
	}, [pendingCamOpenAfterSettings]);

	const handleCameraPress = async () => {
		const perm = await Camera.getCameraPermissionsAsync();

		if (perm.granted) {
			setIsCamViewOpen(true);
			return;
		}

		if (perm.canAskAgain) {
			showPermissionDialog({
				mode: "request",
				title: "Kamera İzni Gerekli",
				description:
					"Barkod tarama özelliğini kullanabilmeniz için kameraya erişim izni gereklidir.",
				bulletPoints: [
					"Barkodları hızlıca tarayarak ürünleri bulabilirsiniz",
					"Ürünlerin güncel fiyatlarını barkod üzerinden inceleyebilirsiniz"
				],
				icon: (
					<CameraIcon
						size={32}
						color="#fff"
					/>
				),
				onConfirm: async () => {
					const res = await Camera.requestCameraPermissionsAsync();
					if (res.granted) {
						setIsCamViewOpen(true);
					}
				}
			});

			return;
		}

		showPermissionDialog({
			mode: "settings",
			title: "Kamera İzni Kapalı",
			description:
				"Barkod tarama özelliğini kullanabilmeniz için kamera iznini cihaz ayarlarından yeniden açmanız gerekiyor.",
			bulletPoints: [
				"Barkod okuyucu ile ürünleri hızlıca bulabilirsiniz",
				"Ürünlerin fiyatlarını barkod üzerinden karşılaştırabilirsiniz"
			],
			icon: (
				<CameraIcon
					size={32}
					color="#fff"
				/>
			),
			note: "Kamera izni daha önce reddedilmiştir. Barkod tarama özelliğini kullanmak için uygulama ayarlarından kameraya yeniden izin vermeniz gereklidir.",
			primaryLabel: "Uygulama ayarlarını aç",
			onConfirm: async () => {
				setPendingCamOpenAfterSettings(true);
				await openSettings();
			}
		});
	};

	return (
		<View>
			<AppTouchableOpacity
				onPress={handleCameraPress}
				hitSlop={10}
			>
				<Text className="mx-1 p-2.5">
					<CameraIcon
						size={24}
						color={lightMutedForeground}
					/>
				</Text>
			</AppTouchableOpacity>
			<BarcodeScanCameraModal
				isCamViewOpen={isCamViewOpen}
				setIsCamViewOpen={setIsCamViewOpen}
			/>
		</View>
	);
};

export default BarcodeScanButton;
