import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Text } from "react-native";
import { ClassNameValue } from "tailwind-merge";

const HeaderText = ({
	children,
	className
}: {
	children: ReactNode;
	className?: ClassNameValue;
}) => {
	return <Text className={cn("text-lg text-center font-semibold", className)}>{children}</Text>;
};

export default HeaderText;
