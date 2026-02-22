import React from "react";
import { View } from "react-native";
import HeaderIcon from "./HeaderIcon";
import HeaderProfileTouchable from "./HeaderProfileTouchable";
import HeaderFilterAndSortTouchable from "./HeaderFilterAndSortTouchable";

type Props =
	| {
			displaySortTouchable: true;
			setDisplayDialog: React.Dispatch<React.SetStateAction<boolean>>;
	  }
	| {
			displaySortTouchable?: false;
			setDisplayDialog?: never;
	  };

const SIDE_W = "w-[46px]";

const HeaderFirstRow = ({ displaySortTouchable, setDisplayDialog }: Props) => {
	return (
		<View className="flex-row items-center">
			<View className={`${SIDE_W} items-start`}>
				<HeaderProfileTouchable />
			</View>

			<View className="flex-1 items-center">
				<HeaderIcon />
			</View>

			<View className={`${SIDE_W} items-end`}>
				{displaySortTouchable ? (
					<HeaderFilterAndSortTouchable setDisplayDialog={setDisplayDialog} />
				) : (
					<View className={SIDE_W} />
				)}
			</View>
		</View>
	);
};

export default HeaderFirstRow;
