import { View } from "react-native";
import HeaderSearchInput from "./HeaderSearchInput";
import HeaderFilterAndSortTouchable from "./HeaderFilterAndSortTouchable";
import HeaderProfileTouchable from "./HeaderProfileTouchable";

type Props =
	| {
			displaySortTouchable: true;
			setDisplayDialog: React.Dispatch<React.SetStateAction<boolean>>;
	  }
	| {
			displaySortTouchable?: false;
			setDisplayDialog?: never;
	  };

const HeaderSecondRow = ({ displaySortTouchable, setDisplayDialog }: Props) => {
	return (
		<View className="flex-row gap-2">
			<HeaderProfileTouchable />

			<HeaderSearchInput />

			{displaySortTouchable && (
				<HeaderFilterAndSortTouchable setDisplayDialog={setDisplayDialog} />
			)}
		</View>
	);
};

export default HeaderSecondRow;
