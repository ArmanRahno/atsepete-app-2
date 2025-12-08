import React from "react";
import { Pressable, PressableProps } from "react-native";

type AppTouchableOpacityProps = PressableProps & {
	activeClassName?: string;
	className?: string;
	disableDefaultActiveOpacity?: boolean;
};

const AppTouchableOpacity: React.FC<AppTouchableOpacityProps> = ({
	className,
	activeClassName,
	disableDefaultActiveOpacity,
	...rest
}) => {
	const defaultActive = disableDefaultActiveOpacity ? "" : "active:opacity-60";

	const mergedClassName = [defaultActive, activeClassName, className].filter(Boolean).join(" ");

	return (
		<Pressable
			className={mergedClassName}
			{...rest}
		/>
	);
};

export default AppTouchableOpacity;
