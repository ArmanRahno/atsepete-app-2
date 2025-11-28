import { cn } from "@/lib/utils";
import Svg, { Path } from "react-native-svg";
import { ClassNameValue } from "tailwind-merge";

const EtheriumSvg = ({ className }: { className?: ClassNameValue }) => {
	return (
		<Svg
			viewBox="0 0 540 879.4"
			height={18}
			width={18}
			className={cn(className)}
		>
			<Path
				d="m269.9 325.2-269.9 122.7 269.9 159.6 270-159.6z"
				opacity=".6"
			/>
			<Path
				d="m0.1 447.8 269.9 159.6v-607.4z"
				opacity=".45"
			/>
			<Path
				d="m270 0v607.4l269.9-159.6z"
				opacity=".8"
			/>
			<Path
				d="m0 499 269.9 380.4v-220.9z"
				opacity=".45"
			/>
			<Path
				d="m269.9 658.5v220.9l270.1-380.4z"
				opacity=".8"
			/>
		</Svg>
	);
};

export default EtheriumSvg;
