import { Modal } from "react-native";
import BarcodeScanCameraView from "./BarcodeScanCameraView";
import { Dispatch, SetStateAction } from "react";

const BarcodeScanCameraModal = ({
	isCamViewOpen,
	setIsCamViewOpen
}: {
	isCamViewOpen: boolean;
	setIsCamViewOpen: Dispatch<SetStateAction<boolean>>;
}) => {
	return (
		<Modal
			visible={isCamViewOpen}
			animationType="none"
			presentationStyle="overFullScreen"
			onRequestClose={() => setIsCamViewOpen(false)}
			transparent
		>
			<BarcodeScanCameraView setIsCamViewOpen={setIsCamViewOpen} />
		</Modal>
	);
};
export default BarcodeScanCameraModal;
