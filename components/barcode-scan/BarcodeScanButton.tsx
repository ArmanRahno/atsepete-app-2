import { lightMutedForeground } from "@/constants/Colors";
import { Camera as CameraIcon } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { useCallback, useState } from "react";
import BarcodeScanCameraModal from "./BarcodeScanCameraModal";

const BarcodeScanButton = () => {
	const [isCamViewOpen, setIsCamViewOpen] = useState<boolean>(false);

	const handlePress = useCallback(() => setIsCamViewOpen(val => !val), [setIsCamViewOpen]);

	return (
		<View>
			<Pressable onPress={handlePress}>
				<Text className="mx-1 p-2">
					<CameraIcon
						size={20}
						color={lightMutedForeground}
					/>
				</Text>
			</Pressable>
			<BarcodeScanCameraModal
				isCamViewOpen={isCamViewOpen}
				setIsCamViewOpen={setIsCamViewOpen}
			/>
		</View>
	);
};

export default BarcodeScanButton;
