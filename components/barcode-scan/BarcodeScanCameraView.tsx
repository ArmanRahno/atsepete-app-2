import { BarcodeScanningResult, CameraView } from "expo-camera";
import { router } from "expo-router";
import { Scan, X, Zap, ZapOff } from "lucide-react-native";
import React, { Dispatch, SetStateAction, useCallback, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import AppTouchableOpacity from "../AppTouchableOpacity";

const BarcodeScanCameraView = ({
	setIsCamViewOpen
}: {
	setIsCamViewOpen: Dispatch<SetStateAction<boolean>>;
}) => {
	const [isFlashlightOn, setIsFlashlightOn] = useState(false);
	const [isProcessingBarcode, setIsProcessingBarcode] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const camRef = useRef<CameraView | null>(null);

	const handleFlashlight = useCallback(() => {
		setIsFlashlightOn(cur => !cur);
	}, []);

	const handleClose = useCallback(() => {
		setIsCamViewOpen(false);
	}, [setIsCamViewOpen]);

	const handleBarcodeScan = useCallback(
		async (barcode: BarcodeScanningResult) => {
			if (isProcessingBarcode) return;
			camRef.current?.pausePreview();
			setIsProcessingBarcode(true);
			setMessage(null);

			try {
				router.navigate({
					pathname: "/(tabs)/barkod/[slug]",
					params: { slug: barcode.data }
				});

				setIsCamViewOpen(false);
			} catch {
				setMessage("Bir hata oluştu. Lütfen tekrar deneyin.");
				setTimeout(() => setMessage(null), 2500);
			} finally {
				camRef.current?.resumePreview();
				setIsProcessingBarcode(false);
			}
		},
		[isProcessingBarcode, setIsCamViewOpen]
	);

	return (
		<View style={styles.container}>
			<CameraView
				ref={camRef}
				style={styles.camera}
				enableTorch={isFlashlightOn}
				onBarcodeScanned={handleBarcodeScan}
			>
				<View>
					<Text>
						<Scan
							size={300}
							strokeWidth={0.6}
							color="#fff"
						/>
					</Text>
				</View>

				{message && (
					<View style={styles.serverMessageContainer}>
						<Text style={styles.serverMessageText}>{message}</Text>
					</View>
				)}

				<View style={styles.buttonContainer}>
					<AppTouchableOpacity
						style={styles.button}
						onPress={handleFlashlight}
					>
						<Text style={styles.svgContainer}>
							{isFlashlightOn ? (
								<Zap
									size={28}
									color="#fff"
								/>
							) : (
								<ZapOff
									size={28}
									color="#fff"
								/>
							)}
						</Text>
					</AppTouchableOpacity>
					<AppTouchableOpacity
						style={styles.button}
						onPress={handleClose}
					>
						<Text style={styles.svgContainer}>
							<X
								size={28}
								color="#fff"
							/>
						</Text>
					</AppTouchableOpacity>
				</View>

				{isProcessingBarcode && (
					<View style={styles.activityIndicatorContainer}>
						<ActivityIndicator
							size={60}
							color="#fff"
						/>
					</View>
				)}
			</CameraView>
		</View>
	);
};

export default BarcodeScanCameraView;

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: "center" },
	camera: { flex: 1, justifyContent: "center", alignItems: "center" },
	buttonContainer: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		margin: 32
	},
	button: {
		backgroundColor: "rgba(0,0,0,0.5)",
		padding: 12,
		borderRadius: 9999
	},
	svgContainer: { fontSize: 28, fontWeight: "bold", color: "white", padding: 4 },
	activityIndicatorContainer: {
		...StyleSheet.absoluteFillObject,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.5)"
	},
	serverMessageContainer: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		alignItems: "center",
		padding: 16,
		marginHorizontal: 32,
		marginBottom: 80,
		backgroundColor: "rgba(0,0,0,0.5)",
		borderRadius: 16
	},
	serverMessageText: {
		color: "#eee",
		fontSize: 16,
		fontWeight: "bold",
		textAlign: "center"
	}
});
