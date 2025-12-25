import { Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";

const MAX_BYTES = 2 * 1024 * 1024;

export async function pickImageAsBase64(): Promise<string | null> {
	const result = await DocumentPicker.getDocumentAsync({
		type: "image/*",
		multiple: false,
		copyToCacheDirectory: true
	});

	if (result.canceled || !result.assets?.[0]) return null;

	const asset = result.assets[0];

	if (asset.mimeType && !asset.mimeType.startsWith("image/")) {
		Alert.alert("Hata", "Lütfen bir resim dosyası seçin.");
		return null;
	}

	const file = new File(asset.uri);

	const size = typeof asset.size === "number" ? asset.size : file.size;

	if (size > MAX_BYTES) {
		Alert.alert("Resim Çok Büyük", "2 MB limitini aşıyor!");
		return null;
	}

	try {
		const base64 = await file.base64();

		const approxBytes = Math.floor((base64.length * 3) / 4);
		if (approxBytes > MAX_BYTES) {
			Alert.alert("Resim Çok Büyük", "2 MB limitini aşıyor!");
			return null;
		}

		return base64;
	} catch {
		Alert.alert("Hata", "Resim okunamadı. Lütfen tekrar deneyin.");
		return null;
	}
}
