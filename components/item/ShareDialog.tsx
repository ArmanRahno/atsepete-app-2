import { Pressable, Share as RNShare } from "react-native";
import { Share } from "lucide-react-native";
import { Platform } from "react-native";
import { cn } from "@/lib/utils";
import { ClassNameValue } from "tailwind-merge";

interface ShareDialogProps {
	shareUrl: string;
	shareMessage: string;
	pressableClassName?: ClassNameValue;
}

const ShareDialog = ({ shareUrl, shareMessage, pressableClassName }: ShareDialogProps) => {
	const nativeShare = async () => {
		const content =
			Platform.OS === "ios"
				? { message: shareMessage, url: shareUrl }
				: { message: `${shareMessage}\n\n${shareUrl}` };

		try {
			await RNShare.share(content);
		} catch (err) {
			console.log("Error sharing:", err);
		}
	};

	return (
		<>
			<Pressable
				className={cn(
					"px-6 py-2 h-9 rounded border border-border justify-center items-center",
					pressableClassName
				)}
				onPress={nativeShare}
			>
				<Share
					size={20}
					color="#000"
				/>
			</Pressable>
		</>
	);
};

export default ShareDialog;

// import React, { useState, useMemo, useEffect } from "react";
// import { Modal, View, Text, Pressable, StyleSheet, Share as RNShare, Linking } from "react-native";
// import * as Clipboard from "expo-clipboard";
// import Icon from "react-native-vector-icons/FontAwesome5";
// import { Share } from "lucide-react-native";
// import { default as ShareLib, Social } from "react-native-share";

// interface ShareDialogProps {
// 	shareUrl: string;
// 	shareMessage: string;
// }

// const ShareDialog: React.FC<ShareDialogProps> = ({ shareUrl, shareMessage }) => {
// 	const [modalVisible, setModalVisible] = useState(false);
// 	const [hasCopied, setHasCopied] = useState(false);

// 	const copyToClipboard = () => {
// 		Clipboard.setStringAsync(shareUrl);
// 		setHasCopied(true);
// 		setTimeout(() => setHasCopied(false), 1500);
// 	};

// 	const nativeShare = async () => {
// 		try {
// 			await RNShare.share({
// 				message: shareMessage,
// 				url: shareUrl
// 			});
// 		} catch (err) {
// 			console.log("Error sharing:", err);
// 		}
// 	};

// 	const openWhatsApp = async () => {
// 		try {
// 			await ShareLib.shareSingle({
// 				social: Social.Whatsapp,
// 				url: shareUrl,
// 				message: shareMessage
// 			});
// 		} catch (error) {
// 			console.log("WhatsApp not installed or user canceled. Error:", error);
// 		}
// 	};

// 	const openTwitter = async () => {
// 		try {
// 			await ShareLib.shareSingle({
// 				social: Social.Twitter,
// 				url: shareUrl,
// 				message: shareMessage
// 			});
// 		} catch (error) {
// 			console.log("Twitter not installed or user canceled. Error:", error);
// 		}
// 	};

// 	const openTelegram = async () => {
// 		try {
// 			await ShareLib.shareSingle({
// 				social: Social.Telegram,
// 				url: shareUrl,
// 				message: shareMessage
// 			});
// 		} catch (e) {
// 			console.log("Error opening Telegram or fallback link:", e);
// 		}
// 	};

// 	const openFacebook = async () => {
// 		try {
// 			await ShareLib.shareSingle({
// 				social: Social.Facebook,
// 				url: shareUrl,
// 				message: shareMessage
// 			});
// 		} catch (error) {
// 			console.log("Facebook not installed or user canceled. Error:", error);
// 		}
// 	};

// 	return (
// 		<>
// 			<Pressable
// 				className="px-6 py-2 h-9 rounded border border-border justify-center items-center"
// 				onPress={() => setModalVisible(true)}
// 			>
// 				<Share
// 					size={20}
// 					color="#000"
// 				/>
// 			</Pressable>

// 			<Modal
// 				transparent={true}
// 				visible={modalVisible}
// 				animationType="slide"
// 				onRequestClose={() => setModalVisible(false)}
// 			>
// 				<Pressable
// 					style={styles.modalOverlay}
// 					onPress={() => setModalVisible(false)}
// 				>
// 					<Pressable
// 						style={styles.dialogContainer}
// 						onPress={() => {}}
// 					>
// 						<Text style={styles.dialogTitle}>Ürünü Paylaş</Text>

// 						<View style={styles.shareRow}>
// 							<Pressable
// 								style={styles.iconButton}
// 								onPress={openWhatsApp}
// 							>
// 								<Icon
// 									name="whatsapp"
// 									size={32}
// 									color="#25D366"
// 								/>
// 							</Pressable>

// 							<Pressable
// 								style={styles.iconButton}
// 								onPress={openTwitter}
// 							>
// 								<Icon
// 									name="twitter"
// 									size={32}
// 									color="#1DA1F2"
// 								/>
// 							</Pressable>

// 							<Pressable
// 								style={styles.iconButton}
// 								onPress={openTelegram}
// 							>
// 								<Icon
// 									name="telegram"
// 									size={32}
// 									color="#0088cc"
// 								/>
// 							</Pressable>

// 							<Pressable
// 								style={styles.iconButton}
// 								onPress={openFacebook}
// 							>
// 								<Icon
// 									name="facebook"
// 									size={32}
// 									color="#1877F2"
// 								/>
// 							</Pressable>

// 							<Pressable
// 								style={styles.iconButton}
// 								onPress={nativeShare}
// 							>
// 								<Icon
// 									name="share"
// 									size={28}
// 									color="#000"
// 								/>
// 							</Pressable>

// 							<Pressable
// 								style={styles.iconButton}
// 								onPress={copyToClipboard}
// 							>
// 								{!hasCopied && (
// 									<Icon
// 										name="copy"
// 										size={28}
// 										color="#000"
// 									/>
// 								)}
// 								{hasCopied && (
// 									<Icon
// 										name="check-circle"
// 										size={28}
// 										color="#00C853"
// 									/>
// 								)}
// 							</Pressable>
// 						</View>

// 						<Pressable
// 							className="self-center border border-border px-4 py-2 mt-2"
// 							onPress={() => setModalVisible(false)}
// 						>
// 							<Text className="font-medium">Kapat</Text>
// 						</Pressable>
// 					</Pressable>
// 				</Pressable>
// 			</Modal>
// 		</>
// 	);
// };

// export default ShareDialog;

// const styles = StyleSheet.create({
// 	modalOverlay: {
// 		flex: 1,
// 		backgroundColor: "rgba(0,0,0,0.2)",
// 		justifyContent: "center",
// 		alignItems: "center"
// 	},
// 	dialogContainer: {
// 		width: "90%",
// 		maxWidth: 400,
// 		padding: 16,
// 		backgroundColor: "#fff",
// 		borderRadius: 12,
// 		shadowColor: "#000",
// 		shadowOpacity: 0.3,
// 		shadowRadius: 4,
// 		elevation: 5
// 	},
// 	dialogTitle: {
// 		fontSize: 18,
// 		fontWeight: "600",
// 		marginBottom: 12,
// 		textAlign: "center"
// 	},
// 	shareRow: {
// 		flexDirection: "row",
// 		justifyContent: "space-between",
// 		marginVertical: 0
// 	},
// 	iconButton: {
// 		justifyContent: "center",
// 		alignItems: "center",
// 		width: 32,
// 		maxWidth: 32,
// 		margin: 8
// 	}
// });
