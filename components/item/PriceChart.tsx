import { useState } from "react";

import {
	Circle,
	LinearGradient,
	vec,
	Text as SKText,
	Line as SKLine,
	SkFont,
	RoundedRect,
	matchFont,
	Rect,
	DashPathEffect,
	useFonts
} from "@shopify/react-native-skia";
import { Easing, useDerivedValue, withTiming, type SharedValue } from "react-native-reanimated";
import { Area, CartesianChart, ChartBounds, Line, useChartPressState } from "victory-native";
import {
	darkBackground,
	darkForeground,
	lightDestructive,
	lightForeground,
	lightMutedForeground,
	lightPrimary,
	lightSecondary,
	lightSecondaryForeground
} from "@/constants/Colors";
import { View } from "react-native";

const clamp = (value: number, min: number, max: number) => {
	"worklet";
	return Math.min(Math.max(value, min), max);
};

export const PriceChart = ({ data }: { data: Item["price_history"] }) => {
	const { state, isActive } = useChartPressState({ x: "0", y: { price: 0 } });
	const [chartData, setChartData] = useState(
		data.map(dp => {
			return {
				...dp,
				date_time: new Date(dp.date_time).toLocaleDateString("tr-TR", {
					year: "numeric",
					month: "numeric",
					day: "numeric"
				})
			};
		})
	);

	const tooltipText1 = useDerivedValue(() => {
		return "₺" + state.y.price.value.value.toFixed(2);
	});
	const tooltipText2 = useDerivedValue(() => {
		return state.x.value.value;
	});

	const fontMgr = useFonts({
		Roboto: [require("../../assets/fonts/Roboto-Regular.ttf")]
	});

	if (!fontMgr) {
		return null;
	}

	const genericFontStyle = {
		fontFamily: "Roboto",
		fontWeight: "400",
		fontSize: 12
	} as const;
	const genericFont = matchFont(genericFontStyle, fontMgr);

	const ttPriceFontStyle = {
		fontFamily: "Roboto",
		fontWeight: "700",
		fontSize: 16
	} as const;
	const ttPriceFont = matchFont(ttPriceFontStyle, fontMgr);

	const ttDateFontStyle = {
		fontFamily: "Roboto",
		fontWeight: "400",
		fontSize: 14
	} as const;
	const ttDateFont = matchFont(ttDateFontStyle, fontMgr);

	return (
		<View className="h-96 mt-6 mb-6">
			<CartesianChart
				renderOutside={({ chartBounds }) => (
					<>
						{isActive ? (
							<>
								<VerticalLine
									stateX={state.x.position}
									chartBounds={chartBounds}
									color={lightDestructive}
								/>
								<ToolTip
									priceFont={ttPriceFont}
									dateFont={ttDateFont}
									text1={tooltipText1}
									text2={tooltipText2}
									x={state.x.position}
									y={state.y.price.position}
									chartBounds={chartBounds}
								/>
							</>
						) : null}
					</>
				)}
				data={chartData}
				xKey="date_time"
				yKeys={["price"]}
				domainPadding={{ top: 30, bottom: 30 }}
				axisOptions={{
					font: genericFont,
					labelColor: lightForeground,
					lineColor: lightMutedForeground,
					labelOffset: 10,
					formatYLabel(label) {
						return `₺${label}`;
					}
				}}
				padding={{ bottom: 30, left: 2, right: 7 }}
				xAxis={{
					tickCount: 10,
					font: genericFont,
					labelRotate: -90,
					formatXLabel(label) {
						if (!label) return "";

						return label.toString();
					}
				}}
				chartPressState={state}
			>
				{({ points, chartBounds }) => (
					<>
						<Line
							curveType="monotoneX"
							points={points.price}
							color={lightPrimary}
							strokeWidth={1.5}
						/>
						<Area
							curveType="monotoneX"
							points={points.price}
							y0={chartBounds.bottom}
						>
							<LinearGradient
								start={vec(chartBounds.bottom, 200)}
								end={vec(chartBounds.bottom, chartBounds.bottom)}
								// colors={[`${lightPrimary}59`, `${lightPrimary}26`]}
								colors={[`${lightPrimary}59`, `${lightPrimary}59`]}
							/>
						</Area>

						{points.price[points.price.length - 1].y && (
							<>
								<SKLine
									p1={{
										x: chartBounds.left,
										y: points.price[points.price.length - 1].y ?? 0
									}}
									p2={{
										x: chartBounds.right,
										y: points.price[points.price.length - 1].y ?? 0
									}}
									color="red"
									strokeWidth={1}
								>
									<DashPathEffect intervals={[5, 5]} />
								</SKLine>
							</>
						)}
					</>
				)}
			</CartesianChart>
		</View>
	);
};

function ToolTip({
	x,
	y,
	text1,
	text2,
	priceFont,
	dateFont,
	chartBounds
}: {
	x: SharedValue<number>;
	y: SharedValue<number>;
	text1: SharedValue<string>;
	text2: SharedValue<string>;
	priceFont: SkFont | null;
	dateFont: SkFont | null;
	chartBounds: ChartBounds;
}) {
	return (
		<>
			<Circle
				cx={x}
				cy={y}
				r={7}
				color="white"
			/>

			<Circle
				cx={x}
				cy={y}
				r={5}
				color={lightDestructive}
			/>

			<HoverBox
				x={x}
				y={y}
				text1={text1}
				text2={text2}
				priceFont={priceFont}
				dateFont={dateFont}
				chartBounds={chartBounds}
			/>
		</>
	);
}

function HoverBox({
	x,
	y,
	text1,
	text2,
	priceFont,
	dateFont,
	chartBounds
}: {
	x: SharedValue<number>;
	y: SharedValue<number>;
	text1: SharedValue<string>;
	text2: SharedValue<string>;
	priceFont: SkFont | null;
	dateFont: SkFont | null;
	chartBounds: ChartBounds;
}) {
	const boxWidth = text1.value.length * 10 + 16;
	const boxHeight = 50;
	const offset = 10;
	const margin = 10;

	const pos = useDerivedValue(() => {
		return withTiming(
			{ animatedX: x.value, animatedY: y.value },
			{ duration: 300, easing: Easing.inOut(Easing.sin) }
		);
	});

	const rectX = useDerivedValue(() => {
		const raw = pos.value.animatedX + offset;
		return clamp(raw, chartBounds.left + margin, chartBounds.right - boxWidth - margin);
	});
	const rectY = useDerivedValue(() => {
		const raw = pos.value.animatedY - boxHeight - offset;
		return Math.max(raw, chartBounds.top + margin);
	});

	const text1X = useDerivedValue(() => rectX.value + 8);
	const text1Y = useDerivedValue(() => rectY.value + 20);

	const text2X = useDerivedValue(() => rectX.value + 8);
	const text2Y = useDerivedValue(() => rectY.value + 40);

	return (
		<>
			<RoundedRect
				x={rectX}
				y={rectY}
				width={boxWidth}
				height={boxHeight}
				color={darkBackground}
				r={4}
			/>
			<SKText
				x={text1X}
				y={text1Y}
				font={priceFont}
				text={text1}
				color={darkForeground}
			/>
			<SKText
				x={text2X}
				y={text2Y}
				font={dateFont}
				text={text2}
				color={darkForeground}
			/>
		</>
	);
}

function VerticalLine({
	stateX,
	chartBounds,
	color
}: {
	stateX: SharedValue<number>;
	chartBounds: { left: number; right: number; top: number; bottom: number };
	color: string;
}) {
	return (
		<Rect
			x={stateX}
			y={chartBounds.top}
			width={1}
			height={chartBounds.bottom - chartBounds.top}
			color={color}
		/>
	);
}
