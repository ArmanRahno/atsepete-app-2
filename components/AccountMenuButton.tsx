import React, { ReactNode } from "react";
import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

interface AccountMenuButtonProps extends TouchableOpacityProps {
	children: ReactNode;
}

const AccountMenuButton = ({ children, ...props }: AccountMenuButtonProps) => {
	return (
		<TouchableOpacity
			className="flex-1 justify-center bg-primary rounded py-2"
			{...props}
		>
			<Text className="text-center text-primary-foreground font-bold">{children}</Text>
		</TouchableOpacity>
	);
};

export default AccountMenuButton;
