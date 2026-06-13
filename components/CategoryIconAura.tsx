import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { View } from "react-native";

const categoryAuraColors: Record<string, string> = {
	elektronik: "#38BDF8",
	telefon: "#38BDF8",
	teknoloji: "#38BDF8",
	"dijital-urunler": "#38BDF8",
	"akilli-ev-sistemleri": "#38BDF8",
	"elektrikli-ev-aletleri": "#FBBF24",
	"kucuk-ev-aletleri": "#FBBF24",
	"ev-ve-yasam": "#FBBF24",
	mutfak: "#F59E0B",
	mobilya: "#D97706",
	"ev-dekorasyon": "#F59E0B",
	"yapi-ve-dekorasyon": "#F97316",
	giyim: "#FB7185",
	"kadin-giyim": "#FB7185",
	"erkek-giyim": "#60A5FA",
	"t-shirt": "#FB7185",
	"takim-elbise": "#A78BFA",
	ayakkabi: "#F97316",
	aksesuar: "#A78BFA",
	"saat-gozluk": "#A78BFA",
	saat: "#A78BFA",
	kozmetik: "#F472B6",
	"kisisel-bakim": "#F472B6",
	"saglik-ve-bakim": "#2DD4BF",
	"temizlik-ve-koruma": "#2DD4BF",
	"temizlik-urunleri": "#2DD4BF",
	kitap: "#A78BFA",
	"kirtasiye-urunleri": "#A78BFA",
	"ofis-ve-kirtasiye": "#A78BFA",
	muzik: "#F472B6",
	"film-ve-dizi": "#818CF8",
	"video-oyun": "#818CF8",
	oyuncak: "#FBBF24",
	hediye: "#F472B6",
	"spor-ve-outdoor": "#22C55E",
	bisiklet: "#22C55E",
	"oto-ve-motosiklet": "#94A3B8",
	"arac-ici-aksesuarlar": "#94A3B8",
	"oto-aksesuar": "#94A3B8",
	"motosiklet-aksesuar": "#94A3B8",
	"anne-ve-bebek": "#F9A8D4",
	"bebek-beslenme": "#F9A8D4",
	"anne-bebek-bakim": "#F9A8D4",
	"evcil-hayvan": "#34D399",
	petshop: "#34D399",
	"organik-urunler": "#22C55E",
	gida: "#22C55E",
	kampanya: "#F87171"
};

export function getCategoryAuraColor(category: string | undefined) {
	return category ? categoryAuraColors[category] ?? "#F59E0B" : "#F59E0B";
}

type CategoryIconAuraProps = {
	category: string | undefined;
	isDark: boolean;
};

export default function CategoryIconAura({ category, isDark }: CategoryIconAuraProps) {
	const auraColor = getCategoryAuraColor(category);
	const size = 116;

	return (
		<View
			pointerEvents="none"
			style={{
				position: "absolute",
				left: -38,
				top: -38,
				width: size,
				height: size
			}}
		>
			<Svg
				width={size}
				height={size}
				viewBox={`0 0 ${size} ${size}`}
			>
				<Defs>
					<RadialGradient
						id="categoryIconAura"
						cx="50%"
						cy="50%"
						r="50%"
					>
						<Stop
							offset="0"
							stopColor={auraColor}
							stopOpacity={isDark ? 0.11 : 0.14}
						/>
						<Stop
							offset="0.32"
							stopColor={auraColor}
							stopOpacity={isDark ? 0.065 : 0.084}
						/>
						<Stop
							offset="0.66"
							stopColor={auraColor}
							stopOpacity={isDark ? 0.022 : 0.028}
						/>
						<Stop
							offset="0.9"
							stopColor={auraColor}
							stopOpacity={0}
						/>
					</RadialGradient>
				</Defs>
				<Circle
					cx={size / 2}
					cy={size / 2}
					r={size / 2}
					fill="url(#categoryIconAura)"
				/>
			</Svg>
		</View>
	);
}
