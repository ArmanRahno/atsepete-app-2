import React, { useMemo } from "react";
import { View } from "react-native";
import {
	Circle,
	LinearGradient,
	vec,
	Text as SkiaText,
	Line as SkiaLine,
	SkFont,
	RoundedRect,
	matchFont,
	Rect,
	DashPathEffect,
	useFonts
} from "@shopify/react-native-skia";
import { Easing, SharedValue, useDerivedValue, withTiming } from "react-native-reanimated";
import { Area, CartesianChart, ChartBounds, Line, useChartPressState } from "victory-native";
import { lightForeground, lightMutedForeground, lightPrimary } from "@/constants/Colors";
import formatPrice from "@/lib/formatPrice";

type PricePoint = Item["price_history"][number];

type ChartPoint = {
	price: number;
	x: number;
	date_label: string;
	__isTail?: boolean;
};

const TAIL_STEP_RATIO = 0.2;

const clamp = (value: number, min: number, max: number) => {
	"worklet";
	return Math.min(Math.max(value, min), max);
};

const formatChartDate = (value: Date | string | null | undefined) => {
	if (!value) return "";

	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return "";

	try {
		return new Intl.DateTimeFormat("tr-TR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			timeZone: "Europe/Istanbul"
		}).format(date);
	} catch {
		return date.toLocaleDateString("tr-TR");
	}
};

function formatTRYWorklet(value: number) {
	"worklet";

	const safe = Number.isFinite(value) ? value : 0;
	const sign = safe < 0 ? "-" : "";
	const abs = Math.abs(safe);

	const fixed = abs.toFixed(2);
	const dotIndex = fixed.indexOf(".");
	const intPart = dotIndex >= 0 ? fixed.slice(0, dotIndex) : fixed;
	const fracPart = dotIndex >= 0 ? fixed.slice(dotIndex + 1) : "00";

	let grouped = "";
	let count = 0;

	for (let i = intPart.length - 1; i >= 0; i--) {
		grouped = intPart[i] + grouped;
		count++;

		if (count % 3 === 0 && i !== 0) {
			grouped = "." + grouped;
		}
	}

	return `${sign}${grouped},${fracPart}`;
}

export const PriceChart = ({ data }: { data: PricePoint[] }) => {
	const { state, isActive } = useChartPressState({ x: 0, y: { price: 0 } });

	const realChartData = useMemo<ChartPoint[]>(() => {
		return data
			.filter(dp => {
				if (!dp || !dp.date_time) return false;
				const parsed = new Date(String(dp.date_time));
				return !Number.isNaN(parsed.getTime());
			})
			.map((dp, index) => ({
				price: Number(dp.price),
				x: index,
				date_label: formatChartDate(dp.date_time)
			}));
	}, [data]);

	const chartData = useMemo<ChartPoint[]>(() => {
		if (realChartData.length === 0) return [];

		const last = realChartData[realChartData.length - 1];

		return [
			...realChartData,
			{
				price: last.price,
				x: last.x + TAIL_STEP_RATIO,
				date_label: last.date_label,
				__isTail: true
			}
		];
	}, [realChartData]);

	const xLabels = useMemo(() => realChartData.map(p => p.date_label), [realChartData]);
	const lastRealIndex = realChartData.length - 1;
	const lastRealDate = realChartData[lastRealIndex]?.date_label ?? "";

	const tooltipText1 = useDerivedValue(() => {
		return `₺${formatTRYWorklet(Number(state.y.price.value.value || 0))}`;
	});

	const tooltipText2 = useDerivedValue(() => {
		const raw = Number(state.x.value.value ?? 0);

		if (!Number.isFinite(raw)) return "";
		if (raw >= lastRealIndex) return lastRealDate;

		const rounded = Math.round(raw);
		return xLabels[rounded] ?? "";
	});

	const fontMgr = useFonts({
		Roboto: [require("../../assets/fonts/Roboto-Regular.ttf")]
	});

	if (!fontMgr || chartData.length === 0) {
		return <View style={{ height: 260 }} />;
	}

	const genericFont = matchFont(
		{
			fontFamily: "Roboto",
			fontWeight: "400",
			fontSize: 11
		},
		fontMgr
	);

	const ttPriceFont = matchFont(
		{
			fontFamily: "Roboto",
			fontWeight: "400",
			fontSize: 15
		},
		fontMgr
	);

	const ttDateFont = matchFont(
		{
			fontFamily: "Roboto",
			fontWeight: "400",
			fontSize: 11
		},
		fontMgr
	);

	const lastPrice = realChartData[lastRealIndex]?.price ?? null;
	const lastPriceLabel =
		typeof lastPrice === "number" ? `Son fiyat: ₺${formatPrice(lastPrice)}` : "";

	const isTailPressed = () => Number(state.x.value.value ?? 0) > lastRealIndex;

	return (
		<View className="mt-1 mb-1 h-[260px]">
			<CartesianChart
				renderOutside={({ chartBounds }) => (
					<>
						{isActive && !isTailPressed() ? (
							<>
								<VerticalLine
									stateX={state.x.position}
									chartBounds={chartBounds}
									color="rgba(124,58,237,0.22)"
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
				xKey="x"
				yKeys={["price"]}
				domainPadding={{ top: 28, bottom: 20 }}
				axisOptions={{
					font: genericFont,
					labelColor: lightMutedForeground,
					lineColor: "rgba(107,114,128,0.16)",
					labelOffset: 8,
					formatYLabel(label) {
						return `₺${formatPrice(Number(label))}`;
					}
				}}
				padding={{ top: 16, right: 10, bottom: 24, left: 6 }}
				xAxis={{
					tickCount: 8,
					font: genericFont,
					labelRotate: -45,
					formatXLabel(label) {
						const raw = Number(label);

						if (!Number.isFinite(raw)) return "";

						const rounded = Math.round(raw);

						// hide the fractional tail tick
						if (Math.abs(raw - rounded) > 0.001) return "";

						return xLabels[rounded] ?? "";
					}
				}}
				chartPressState={state}
			>
				{({ points, chartBounds }) => {
					const lastRealPoint = points.price[lastRealIndex];

					if (!lastRealPoint || lastRealPoint.x == null || lastRealPoint.y == null) {
						return null;
					}

					return (
						<>
							<Line
								curveType={"stepAfter" as never}
								points={points.price}
								color={lightPrimary}
								strokeWidth={3}
							/>

							<Area
								curveType={"stepAfter" as never}
								points={points.price}
								y0={chartBounds.bottom}
							>
								<LinearGradient
									start={vec(0, chartBounds.top)}
									end={vec(0, chartBounds.bottom)}
									colors={[
										"rgba(124,58,237,0.28)",
										"rgba(124,58,237,0.10)",
										"rgba(124,58,237,0.02)"
									]}
								/>
							</Area>

							{typeof lastPrice === "number" ? (
								<LastPriceGuide
									label={lastPriceLabel}
									font={genericFont}
									chartBounds={chartBounds}
									y={lastRealPoint.y}
								/>
							) : null}
						</>
					);
				}}
			</CartesianChart>
		</View>
	);
};

function LastPriceGuide({
	label,
	font,
	chartBounds,
	y
}: {
	label: string;
	font: SkFont | null;
	chartBounds: ChartBounds;
	y: number;
}) {
	if (!font) return null;

	const pillWidth = Math.max(96, label.length * 5.9 + 14);
	const pillHeight = 20;
	const pillTop = clamp(y - 22, chartBounds.top + 4, chartBounds.bottom - pillHeight - 4);

	return (
		<>
			<SkiaLine
				p1={{ x: chartBounds.left, y }}
				p2={{ x: chartBounds.right, y }}
				color="rgba(107,114,128,0.38)"
				strokeWidth={1.5}
			>
				<DashPathEffect intervals={[6, 6]} />
			</SkiaLine>

			<RoundedRect
				x={chartBounds.left + 4}
				y={pillTop}
				width={pillWidth}
				height={pillHeight}
				r={10}
				color="rgba(255,255,255,0.96)"
			/>

			<RoundedRect
				x={chartBounds.left + 4}
				y={pillTop}
				width={pillWidth}
				height={pillHeight}
				r={10}
				color="rgba(124,58,237,0.14)"
				style="stroke"
				strokeWidth={1}
			/>

			<SkiaText
				x={chartBounds.left + 12}
				y={pillTop + 14}
				font={font}
				text={label}
				color={lightPrimary}
			/>
		</>
	);
}

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
				r={4.5}
				color={lightPrimary}
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
	const boxWidth = useDerivedValue(() => Math.max(88, text1.value.length * 8.4 + 16));
	const boxHeight = 46;
	const offset = 10;
	const margin = 6;

	const pos = useDerivedValue(() => {
		return withTiming(
			{ animatedX: x.value, animatedY: y.value },
			{ duration: 180, easing: Easing.out(Easing.cubic) }
		);
	});

	const rectX = useDerivedValue(() => {
		const raw = pos.value.animatedX + offset;
		return clamp(raw, chartBounds.left + margin, chartBounds.right - boxWidth.value - margin);
	});

	const rectY = useDerivedValue(() => {
		const raw = pos.value.animatedY - boxHeight - offset;
		return clamp(raw, chartBounds.top + margin, chartBounds.bottom - boxHeight - margin);
	});

	const text1X = useDerivedValue(() => rectX.value + 8);
	const text1Y = useDerivedValue(() => rectY.value + 18);

	const text2X = useDerivedValue(() => rectX.value + 8);
	const text2Y = useDerivedValue(() => rectY.value + 34);

	if (!priceFont || !dateFont) return null;

	return (
		<>
			<RoundedRect
				x={rectX}
				y={rectY}
				width={boxWidth}
				height={boxHeight}
				r={12}
				color="rgba(255,255,255,0.96)"
			/>

			<RoundedRect
				x={rectX}
				y={rectY}
				width={boxWidth}
				height={boxHeight}
				r={12}
				color="rgba(124,58,237,0.14)"
				style="stroke"
				strokeWidth={1}
			/>

			<SkiaText
				x={text1X}
				y={text1Y}
				font={priceFont}
				text={text1}
				color={lightForeground}
			/>

			<SkiaText
				x={text2X}
				y={text2Y}
				font={dateFont}
				text={text2}
				color={lightMutedForeground}
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
		>
			<DashPathEffect intervals={[4, 4]} />
		</Rect>
	);
}
