import React, { useMemo, useRef, useState } from "react";
import { Modal, View, Text, Pressable, Alert } from "react-native";
import QRCodeSvg from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system/legacy";
import {
	QrCode,
	Download,
	Clipboard as ClipboardIcon,
	Check,
	Share2,
	X,
	CheckCircle,
	TriangleAlert
} from "lucide-react-native";
import { cn } from "@/lib/utils";
import { ClassNameValue } from "tailwind-merge";
import { lightPrimary, lightSecondary } from "@/constants/Colors";
import Share from "react-native-share";
import AppTouchableOpacity from "./AppTouchableOpacity";

type ShareQRDialogProps = {
	url: string;
	title?: string;
	caption?: string;
	pressableClassName?: ClassNameValue;
};

const ShareQRDialog: React.FC<ShareQRDialogProps> = ({
	url,
	title,
	caption,
	pressableClassName
}) => {
	const [visible, setVisible] = useState(false);
	const [copied, setCopied] = useState(false);
	const [saving, setSaving] = useState(false);
	const [saveStatus, setSaveStatus] = useState<"success" | "error" | null>(null);

	const qrRef = useRef<any | null>(null);

	const textWithUrl = useMemo(() => (caption ? `${caption.trim()} ${url}` : url), [caption, url]);

	const clipboardText = textWithUrl;

	const shareMessage = textWithUrl;

	const shortUrl = useMemo(() => url.replace(/^https?:\/\//, ""), [url]);

	const open = () => setVisible(true);
	const close = () => setVisible(false);

	const createQrPngFile = (): Promise<string | null> => {
		return new Promise((resolve, reject) => {
			if (!qrRef.current) {
				resolve(null);
				return;
			}

			qrRef.current.toDataURL((data: string) => {
				try {
					const fileName = `qr-${Date.now()}.png`;
					const dir = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;

					if (!dir) {
						console.warn("Dosya dizini bulunamadı.");
						resolve(null);
						return;
					}

					const fileUri = `${dir}${fileName}`;

					FileSystem.writeAsStringAsync(fileUri, data, {
						encoding: "base64"
					})
						.then(() => resolve(fileUri))
						.catch(err => reject(err));
				} catch (err) {
					reject(err);
				}
			});
		});
	};

	const handleSave = async () => {
		if (!qrRef.current || saving) return;

		try {
			const { status } = await MediaLibrary.requestPermissionsAsync();
			if (status !== "granted") {
				Alert.alert("İzin gerekli", "Galeriye kaydetmek için izin vermeniz gerekiyor.");
				return;
			}

			setSaving(true);
			setSaveStatus(null);

			const fileUri = await createQrPngFile();
			if (!fileUri) {
				setSaveStatus("error");
				return;
			}

			await MediaLibrary.saveToLibraryAsync(fileUri);

			setSaveStatus("success");
		} catch (error) {
			console.warn("QR kaydedilirken hata oluştu:", error);
			setSaveStatus("error");
		} finally {
			setSaving(false);
			setTimeout(() => {
				setSaveStatus(null);
			}, 3000);
		}
	};

	const handleCopy = async () => {
		if (!clipboardText) return;

		try {
			await Clipboard.setStringAsync(clipboardText);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {
			// ignore
		}
	};

	const createQrBase64 = (): Promise<string | null> =>
		new Promise(resolve => {
			if (!qrRef.current) return resolve(null);

			qrRef.current.toDataURL((data: string) => {
				resolve(data);
			});
		});

	const handleShare = async () => {
		if (!shareMessage) return;

		try {
			const base64 = await createQrBase64();

			const options: any = base64
				? {
						title: caption ?? title ?? "QR kodunu paylaş",
						message: shareMessage,
						url: `data:image/png;base64,${base64}`,
						type: "image/png",
						failOnCancel: false,
						useInternalStorage: true
				  }
				: {
						title: caption ?? title ?? "QR kodunu paylaş",
						message: shareMessage,
						failOnCancel: false
				  };

			await Share.open(options);
		} catch (error: any) {
			if (error?.message?.includes("User did not share")) return;
			console.warn("Paylaşırken hata oluştu:", error);
		}
	};

	const stopPropagation = (e: any) => {
		e.stopPropagation();
	};

	return (
		<>
			<Pressable
				onPress={open}
				accessibilityLabel="QR ile paylaş"
				className={cn(
					"px-2 py-2 h-10 rounded border border-border justify-center items-center",
					pressableClassName
				)}
			>
				<QrCode size={20} />
			</Pressable>

			<Modal
				visible={visible}
				transparent
				animationType="fade"
				onRequestClose={close}
			>
				<Pressable
					style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
					onPress={close}
				>
					<View
						className="mx-6 my-auto rounded-2xl bg-white px-4 py-6"
						onStartShouldSetResponder={() => true}
					>
						{title && (
							<Text className="text-xl font-bold text-center mb-2">{title}</Text>
						)}

						<View className="self-center bg-white p-3 rounded-xl shadow-sm mb-4">
							{url ? (
								<QRCodeSvg
									value={url}
									size={192}
									backgroundColor="#ffffff"
									color="#000000"
									quietZone={16}
									getRef={(c: any) => {
										qrRef.current = c;
									}}
								/>
							) : null}
						</View>

						<Text
							className="text-lg font-medium text-center mb-4"
							numberOfLines={1}
							ellipsizeMode="tail"
						>
							{shortUrl}
						</Text>

						{saveStatus === "success" && (
							<View className="flex-row items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 mb-2">
								<CheckCircle
									color="#fff"
									size={20}
								/>
								<Text className="text-sm font-medium text-white">
									QR kodu galeriye kaydedildi.
								</Text>
							</View>
						)}
						{saveStatus === "error" && (
							<View className="flex-row items-center gap-2 rounded-xl bg-destructive px-4 py-2 mb-2">
								<TriangleAlert
									color="#fff"
									size={20}
								/>
								<Text className="text-sm font-medium text-destructive-foreground">
									QR kodu kaydedilirken bir hata oluştu.
								</Text>
							</View>
						)}

						<View className="flex-row gap-2">
							<AppTouchableOpacity
								onPress={handleSave}
								disabled={!url || saving}
								className="flex-1 flex-row items-center justify-center rounded-xl p-3 opacity-100 disabled:opacity-60"
								style={{ backgroundColor: lightPrimary }}
							>
								<Download
									color="#fff"
									size={16}
									style={{ marginRight: 6 }}
								/>
								<Text className="font-medium text-white">Kaydet</Text>
							</AppTouchableOpacity>

							<AppTouchableOpacity
								onPress={handleCopy}
								disabled={!clipboardText}
								className="flex-1 flex-row items-center justify-center rounded-xl border border-border p-[11px] opacity-100 disabled:opacity-60"
							>
								{copied ? (
									<>
										<Check
											size={16}
											style={{ marginRight: 6 }}
										/>
										<Text className="font-medium">Kopyalandı</Text>
									</>
								) : (
									<>
										<ClipboardIcon
											size={16}
											style={{ marginRight: 6 }}
										/>
										<Text className="font-medium">Kopyala</Text>
									</>
								)}
							</AppTouchableOpacity>

							<AppTouchableOpacity
								onPress={handleShare}
								disabled={!shareMessage}
								className="flex-1 flex-row items-center justify-center rounded-xl p-3 opacity-100 disabled:opacity-60"
								style={{ backgroundColor: lightSecondary }}
							>
								<Share2
									size={16}
									style={{ marginRight: 6 }}
								/>
								<Text className="font-medium">Paylaş</Text>
							</AppTouchableOpacity>
						</View>

						<AppTouchableOpacity
							onPress={close}
							hitSlop={24}
							className="absolute top-3 right-3 p-1 rounded-full"
						>
							<X size={24} />
						</AppTouchableOpacity>
					</View>
				</Pressable>
			</Modal>
		</>
	);
};

export default ShareQRDialog;
