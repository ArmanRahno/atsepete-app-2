import { reloadAppAsync } from "expo";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import WebBrowser from "expo-web-browser";

const DeleteAccountBtn = () => {
	return (
		<TouchableOpacity
			className="bg-destructive px-4 py-2 rounded-lg self-start mt-2"
			onPress={() =>
				Alert.alert(
					"Hesabı Sil",
					"Hesabınızı ve verilerinizi kalıcı olarak silmek istediğinize emin misiniz?",
					[
						{ text: "Vazgeç", style: "cancel" },
						{
							text: "Evet",
							style: "destructive",
							onPress: async () => {
								await WebBrowser.openAuthSessionAsync(
									"https://atsepete.net/kullanici/hesap-sil"
								);

								await reloadAppAsync("Revoke auth state");
							}
						}
					]
				)
			}
		>
			<Text className="text-destructive-foreground font-medium">Hesabı Sil</Text>
		</TouchableOpacity>
	);
};
export default DeleteAccountBtn;
const styles = StyleSheet.create({});
