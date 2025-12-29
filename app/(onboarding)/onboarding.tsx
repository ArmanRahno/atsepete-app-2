import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	NativeScrollEvent,
	NativeSyntheticEvent,
	Image,
	Linking,
	useWindowDimensions,
	Animated,
	Easing
} from "react-native";
import { Stack, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Check, ChevronRight, Play } from "lucide-react-native";
import Svg, { G, Path } from "react-native-svg";

import AppTouchableOpacity from "@/components/AppTouchableOpacity";
import {
	lightBackground,
	lightForeground,
	lightMutedForeground,
	lightPrimary,
	lightMuted,
	lightBorder
} from "@/constants/Colors";
import AtSepeteIcon from "@/assets/icons/AtSepeteIcon";

export const ONBOARDING_KEY = "onboarding_seen_v1";

type Slide = {
	key: string;
	eyebrow: string;
	title: string;
	desc: string;
	bullets: string[];
	gradient: [string, string];
	accent: string;
	youtubeId?: string;
};

const HERO_TEXT = "#FFFFFF";
const HERO_MUTED = "rgba(255,255,255,0.78)";

function lightenHex(color: string, amount = 0.1) {
	if (!color?.startsWith("#") || (color.length !== 7 && color.length !== 4)) return color;

	const hex =
		color.length === 4
			? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
			: color;

	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);

	const f = (v: number) => Math.max(0, Math.min(255, Math.round(v + (255 - v) * amount)));
	const rr = f(r).toString(16).padStart(2, "0");
	const gg = f(g).toString(16).padStart(2, "0");
	const bb = f(b).toString(16).padStart(2, "0");

	return `#${rr}${gg}${bb}`;
}

function YoutubeLogoBadge(props: { width?: number; height?: number }) {
	const width = props.width ?? 34;
	const height = props.height ?? 24;

	return (
		<Svg
			viewBox="0 0 28.57 20"
			width={width}
			height={height}
			preserveAspectRatio="xMidYMid meet"
		>
			<G>
				<Path
					d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 2.24288e-07 14.285 0 14.285 0C14.285 0 5.35042 2.24288e-07 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C2.24288e-07 5.35042 0 10 0 10C0 10 2.24288e-07 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z"
					fill="#FF0000"
				/>
				<Path
					d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z"
					fill="#FFFFFF"
				/>
			</G>
		</Svg>
	);
}

export default function OnboardingScreen() {
	const router = useRouter();
	const { width } = useWindowDimensions();

	const slides: Slide[] = [
		{
			key: "welcome",
			eyebrow: "HOŞ GELDİNİZ",
			title: "Fırsatları tek ekranda yakalayın",
			desc: "Birçok sitedeki indirimli ürünleri sizin için tarar, tek listede gösteririz.",
			bullets: [
				"Farklı siteler tek yerde",
				"Yeni indirimler sürekli eklenir",
				"Hızlı ve temiz liste"
			],
			gradient: [lightPrimary, "#0B1220"],
			accent: "#8F00FF"
		},
		{
			key: "discover",
			eyebrow: "KEŞFEDİN",
			title: "Aradığınızı hızlı bulun",
			desc: "Kategorilere göz atın, filtreleyin, sıralayın — indirimi kaçırmayın.",
			bullets: [
				"Kategori bazlı gezinin",
				"Fiyata göre filtreleyin",
				"Tarihe / indirim oranına göre sıralayın"
			],
			gradient: ["#166534", "#0B1220"],
			accent: "#4ADE80"
		},
		{
			key: "alerts",
			eyebrow: "ALARM KURUN",
			title: "İndirim olunca haberiniz olsun",
			desc: "Ürün, kategori veya pazaryeri seçin. İndirim çıktığında size haber verelim.",
			bullets: ["Ürün alarmı kurun", "Kategori alarmı kurun", "İndirim olunca bildirim alın"],
			gradient: ["#9A3412", "#0B1220"],
			accent: "#FF2A00"
		},
		{
			key: "video",
			eyebrow: "HIZLI TUR",
			title: "Hemen başlayın",
			desc: "Nasıl kullanıldığını izleyin.",
			bullets: ["Kısa kullanım videosu", "Alarm kurmayı görün", "Hazırsanız başlayın"],
			gradient: ["#1D4ED8", "#0B1220"],
			accent: "#3F3FFF",
			youtubeId: "WmkMVadrug4"
		}
	];

	const primaryBright = useMemo(() => lightenHex(lightPrimary, 0.06), []);

	const listRef = useRef<FlatList<Slide>>(null);
	const [index, setIndex] = useState(0);
	const isLast = index === slides.length - 1;
	const progress = (index + 1) / slides.length;

	const [trackW, setTrackW] = useState(0);
	const animatedW = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		if (!trackW) return;
		Animated.timing(animatedW, {
			toValue: trackW * progress,
			duration: 420,
			easing: Easing.out(Easing.cubic),
			useNativeDriver: false
		}).start();
	}, [animatedW, progress, trackW]);

	const finish = useCallback(async () => {
		await AsyncStorage.setItem(ONBOARDING_KEY, "true");
		router.replace("/");
	}, [router]);

	const goTo = useCallback(
		(i: number) => {
			listRef.current?.scrollToOffset({ offset: i * width, animated: true });
		},
		[width]
	);

	const onScrollEnd = useCallback(
		(e: NativeSyntheticEvent<NativeScrollEvent>) => {
			const x = e.nativeEvent.contentOffset.x;
			setIndex(Math.round(x / width));
		},
		[width]
	);

	const onNext = useCallback(() => {
		if (!isLast) goTo(index + 1);
		else void finish();
	}, [finish, goTo, index, isLast]);

	const openYoutube = useCallback((id?: string) => {
		if (!id) return;
		Linking.openURL(`https://www.youtube.com/watch?v=${id}`).catch(() => {});
	}, []);

	return (
		<View style={[styles.root, { backgroundColor: lightBackground }]}>
			<Stack.Screen options={{ headerShown: false }} />

			<View style={styles.topBar}>
				<View style={styles.brandRow}>
					<AtSepeteIcon
						width={22}
						height={22}
						fill={lightPrimary}
					/>
					<Text style={[styles.brandText, { color: lightForeground }]}>ATSEPETE.NET</Text>
				</View>

				<View style={styles.topRight}>
					<Text style={[styles.stepText, { color: lightMutedForeground }]}>
						{index + 1}/{slides.length}
					</Text>
					<AppTouchableOpacity
						onPress={finish}
						style={styles.skipBtn}
					>
						<Text style={[styles.skipText, { color: lightMutedForeground }]}>Geç</Text>
					</AppTouchableOpacity>
				</View>
			</View>

			<FlatList
				ref={listRef}
				data={slides}
				keyExtractor={s => s.key}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				onMomentumScrollEnd={onScrollEnd}
				renderItem={({ item }) => {
					const accentBright = lightenHex(item.accent, 0.08);

					return (
						<View style={[styles.page, { width }]}>
							<LinearGradient
								colors={item.gradient}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								style={styles.headerBand}
							>
								<View style={styles.headerInner}>
									<View
										style={[styles.eyebrowPill, { borderColor: accentBright }]}
									>
										<Text style={[styles.eyebrowText, { color: HERO_TEXT }]}>
											{item.eyebrow}
										</Text>
									</View>

									<Text style={[styles.title, { color: HERO_TEXT }]}>
										{item.title}
									</Text>
									<Text style={[styles.desc, { color: HERO_MUTED }]}>
										{item.desc}
									</Text>

									<AtSepeteIcon
										width={160}
										height={160}
										fill={"rgba(255,255,255,0.12)"}
										style={styles.watermark}
									/>
								</View>
							</LinearGradient>

							<View
								style={[
									styles.bodyCard,
									{ borderColor: lightBorder, backgroundColor: lightBackground }
								]}
							>
								<Text style={[styles.sectionTitle, { color: lightForeground }]}>
									Özellikler
								</Text>

								{item.bullets.map((b, i) => (
									<View
										key={`${item.key}-${i}`}
										style={styles.bulletRow}
									>
										<View style={styles.bulletIcon}>
											<Check
												color={accentBright}
												size={16}
											/>
										</View>
										<Text
											style={[styles.bulletText, { color: lightForeground }]}
										>
											{b}
										</Text>
									</View>
								))}

								{item.youtubeId && (
									<AppTouchableOpacity
										onPress={() => openYoutube(item.youtubeId)}
										style={[styles.youtubeRow, { borderColor: lightBorder }]}
									>
										<View style={styles.youtubeThumbWrap}>
											<Image
												source={{
													uri: `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`
												}}
												style={styles.youtubeThumb}
											/>
											<LinearGradient
												colors={["rgba(0,0,0,0.08)", "rgba(0,0,0,0.50)"]}
												start={{ x: 0, y: 0 }}
												end={{ x: 0, y: 1 }}
												style={styles.youtubeOverlay}
											/>
											<View style={styles.youtubeBadge}>
												<YoutubeLogoBadge />
											</View>
										</View>

										<View style={styles.youtubeMeta}>
											<Text
												style={[
													styles.youtubeTitle,
													{ color: lightForeground }
												]}
											>
												Kullanım videosu
											</Text>
											<View style={styles.youtubePillRow}>
												<View style={styles.pill}>
													<Play
														size={14}
														color={lightPrimary}
													/>
													<Text
														style={[
															styles.pillText,
															{ color: lightPrimary }
														]}
													>
														YouTube’da izle
													</Text>
												</View>
											</View>
										</View>
									</AppTouchableOpacity>
								)}
							</View>
						</View>
					);
				}}
			/>

			<View style={styles.bottom}>
				<View
					style={[styles.progressTrack, { backgroundColor: lightMuted }]}
					onLayout={e => setTrackW(e.nativeEvent.layout.width)}
				>
					<Animated.View
						style={[
							styles.progressFill,
							{ width: animatedW, backgroundColor: primaryBright }
						]}
					/>
				</View>

				<View style={styles.dotsRow}>
					{slides.map((s, i) => {
						const active = i === index;
						const dotColor = lightenHex(s.accent, 0.08);

						return (
							<View
								key={s.key}
								style={[
									styles.dot,
									{
										width: active ? 18 : 8,
										backgroundColor: dotColor
									}
								]}
							/>
						);
					})}
				</View>

				<AppTouchableOpacity
					style={[styles.primaryBtn, { backgroundColor: primaryBright }]}
					onPress={onNext}
				>
					<Text style={[styles.primaryText, { color: lightBackground }]}>
						{isLast ? "Başla" : "İleri"}
					</Text>
					<ChevronRight
						size={18}
						color={lightBackground}
					/>
				</AppTouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	root: { flex: 1 },

	topBar: {
		paddingTop: 44,
		paddingHorizontal: 16,
		paddingBottom: 10,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between"
	},
	brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
	brandText: { fontWeight: "900", letterSpacing: 1.2, fontSize: 12 },
	topRight: { flexDirection: "row", alignItems: "center", gap: 10 },
	stepText: { fontWeight: "800", fontSize: 12 },
	skipBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
	skipText: { fontWeight: "800", fontSize: 12 },

	page: { flex: 1, paddingHorizontal: 16, paddingBottom: 10 },

	headerBand: {
		borderRadius: 18,
		overflow: "hidden"
	},
	headerInner: {
		padding: 16,
		minHeight: 240,
		justifyContent: "center"
	},
	eyebrowPill: {
		alignSelf: "flex-start",
		borderWidth: 1,
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 999,
		marginBottom: 10,
		backgroundColor: "rgba(255,255,255,0.14)"
	},
	eyebrowText: { fontWeight: "900", fontSize: 11, letterSpacing: 0.6 },
	title: { fontSize: 24, fontWeight: "900", letterSpacing: -0.3 },
	desc: { marginTop: 8, fontSize: 14, lineHeight: 20, fontWeight: "700" },

	watermark: { position: "absolute", right: -22, bottom: -28 },

	bodyCard: {
		marginTop: 12,
		borderWidth: 1,
		borderRadius: 16,
		padding: 14
	},
	sectionTitle: { fontWeight: "900", fontSize: 13, marginBottom: 10 },

	bulletRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 7 },
	bulletIcon: {
		width: 24,
		height: 24,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: lightBackground,
		borderWidth: 1,
		borderColor: lightBorder
	},

	bulletText: { fontSize: 14, fontWeight: "800" },

	youtubeRow: {
		marginTop: 12,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderWidth: 1,
		borderRadius: 14,
		overflow: "hidden",
		flexDirection: "row",
		backgroundColor: "#FFFFFF",
		alignItems: "center"
	},

	youtubeThumbWrap: {
		width: 128,
		aspectRatio: 16 / 9,
		borderRadius: 12,
		overflow: "hidden",
		alignSelf: "center"
	},

	youtubeThumb: {
		width: "100%",
		height: "100%",
		resizeMode: "cover",
		transform: [{ scale: 1.05 }] // Scale so that thumbnail's black borders are not visible.
	},

	youtubeOverlay: {
		...StyleSheet.absoluteFillObject
	},
	youtubeBadge: { position: "absolute", left: 10, bottom: 10 },
	youtubeMeta: { flex: 1, padding: 12, justifyContent: "center" },
	youtubeTitle: { fontWeight: "900", fontSize: 14 },
	youtubePillRow: { marginTop: 8, flexDirection: "row" },
	pill: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 999,
		backgroundColor: "#EEF2FF",
		borderWidth: 1,
		borderColor: "#DDE3FF"
	},
	pillText: { fontWeight: "900", fontSize: 12 },

	bottom: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 10 },
	progressTrack: { height: 6, borderRadius: 999, overflow: "hidden" },
	progressFill: { height: 6, borderRadius: 999 },

	dotsRow: {
		flexDirection: "row",
		justifyContent: "center",
		gap: 8,
		marginTop: 10,
		marginBottom: 10
	},
	dot: { height: 8, borderRadius: 999 },

	primaryBtn: {
		borderRadius: 14,
		paddingVertical: 14,
		paddingHorizontal: 16,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8
	},
	primaryText: { fontWeight: "900", fontSize: 15 }
});
