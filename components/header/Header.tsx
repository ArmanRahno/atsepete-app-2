import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { View } from "react-native";
import { ClassNameValue } from "tailwind-merge";

const Header = ({ children, className }: { children: ReactNode; className?: ClassNameValue }) => {
	return (
		<View className={cn("bg-background p-3 pb-1.5 shadow z-[1] gap-3 elevation-md", className)}>
			{children}
		</View>
	);
};

export default Header;
