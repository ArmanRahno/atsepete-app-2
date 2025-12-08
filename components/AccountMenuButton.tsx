import React, { ReactNode } from "react";
import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";
import AppTouchableOpacity from "./AppTouchableOpacity";

interface AccountMenuButtonProps extends TouchableOpacityProps {
	children: ReactNode;
}

const AccountMenuButton = ({ children, ...props }: AccountMenuButtonProps) => {
	return (
		<AppTouchableOpacity
			className="flex-1 justify-center bg-primary rounded py-2"
			{...props}
		>
			<Text className="text-center text-primary-foreground font-bold">{children}</Text>
		</AppTouchableOpacity>
	);
};

export default AccountMenuButton;
