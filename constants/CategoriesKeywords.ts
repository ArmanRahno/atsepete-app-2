const merge = (...parts: readonly (readonly string[])[]) => Array.from(new Set(parts.flat()));

const BRANDS = {
	phone: [
		"samsung",
		"apple",
		"iphone",
		"xiaomi",
		"huawei",
		"oppo",
		"realme",
		"vivo",
		"honor",
		"oneplus"
	],
	computer: [
		"lenovo",
		"hp",
		"dell",
		"asus",
		"acer",
		"msi",
		"apple",
		"macbook",
		"monster",
		"casper",
		"huawei"
	],
	tvAudio: ["samsung", "lg", "sony", "philips", "jbl", "bose", "anker", "logitech"],
	appliancesTR: ["arcelik", "beko", "vestel", "grundig", "altus"],
	appliancesGlobal: [
		"bosch",
		"siemens",
		"philips",
		"tefal",
		"fakir",
		"dyson",
		"arzum",
		"karaca",
		"korkmaz"
	],
	cosmeticsTR: ["flormar", "golden rose", "note", "farmasi", "pastel"],
	cosmeticsGlobal: ["loreal", "maybelline", "nyx", "mac", "nivea", "dove", "garnier"],
	sports: ["nike", "adidas", "puma", "new balance", "decathlon", "under armour"],
	clothingTR: ["lc waikiki", "lcwaikiki", "defacto", "koton", "mavi", "colins"],
	shoes: ["nike", "adidas", "puma", "skechers", "converse", "vans", "timberland"],
	printing: ["hp", "canon", "epson", "brother"],
	auto: ["bosch", "michelin", "continental", "pirelli", "castrol", "motul"],
	pet: ["royal canin", "proplan", "purina", "whiskas", "felix"],
	baby: ["pampers", "prima", "molfix", "sleepy", "chicco", "philips avent", "mustela"],
	gaming: ["playstation", "ps5", "xbox", "nintendo", "switch", "steam", "epic"],
	smartHome: ["xiaomi", "tp link", "tapo", "philips hue", "tuya", "sonoff"]
} as const;

const CategoriesKeywords: Record<string, readonly string[]> = {
	"elektronik": merge(
		[
			"bilgisayar",
			"laptop",
			"notebook",
			"tablet",
			"monitör",
			"klavye",
			"mouse",
			"kulaklık",
			"hoparlör",
			"yazıcı",
			"router",
			"modem",
			"ssd",
			"harici disk",
			"usb",
			"kablo",
			"şarj aleti",
			"powerbank",
			"tv",
			"televizyon"
		],
		BRANDS.computer,
		BRANDS.tvAudio
	),
	"ev-ve-yasam": [
		"ev ürünleri",
		"banyo",
		"yatak odası",
		"nevresim",
		"yorgan",
		"yastık",
		"halı",
		"perde",
		"kırlent",
		"saklama",
		"düzenleyici"
	],
	"giyim": merge(
		["giyim", "pantolon", "jean", "tişört", "gömlek", "ceket", "kazak", "eşofman", "tayt"],
		BRANDS.clothingTR
	),
	"telefon": merge(
		[
			"telefon",
			"akıllı telefon",
			"kılıf",
			"ekran koruyucu",
			"şarj",
			"kablosuz şarj",
			"powerbank",
			"kulaklık"
		],
		BRANDS.phone
	),
	"kozmetik": merge(
		[
			"kozmetik",
			"makyaj",
			"ruj",
			"fondöten",
			"maskara",
			"parfüm",
			"cilt bakım",
			"nemlendirici"
		],
		BRANDS.cosmeticsTR,
		BRANDS.cosmeticsGlobal
	),
	"saat-gozluk": ["saat", "kol saati", "akıllı saat", "gözlük", "güneş gözlük", "lens"],
	"kitap": [
		"kitap",
		"roman",
		"ders kitabı",
		"çocuk kitabı",
		"kişisel gelişim",
		"ingilizce",
		"almanca"
	],
	"oyuncak": ["oyuncak", "lego", "bebek", "araba", "zeka oyunu", "puzzle", "oyun hamuru"],
	"spor-ve-outdoor": merge(
		["spor", "fitness", "koşu", "yürüyüş", "kamp", "outdoor", "çadır", "uyku tulumu", "mat"],
		BRANDS.sports
	),
	"oto-ve-motosiklet": merge(
		["oto", "araba", "motosiklet", "motor", "lastik", "akü", "bakım", "aksesuar"],
		BRANDS.auto
	),
	"anne-ve-bebek": merge(
		["anne", "bebek", "bebek bezi", "ıslak mendil", "biberon", "emzik", "puset", "ana kucağı"],
		BRANDS.baby
	),
	"mobilya": ["mobilya", "koltuk", "kanepe", "sandalye", "masa", "yatak", "dolap", "kitaplık"],
	"ofis-ve-kirtasiye": merge(
		["ofis", "kırtasiye", "kalem", "defter", "ajanda", "dosya", "yazıcı", "toner"],
		BRANDS.printing
	),
	"muzik": ["müzik", "gitar", "piyano", "klavye", "kulaklık", "mikrofon", "amfi"],
	"film-ve-dizi": [
		"film",
		"dizi",
		"koleksiyon",
		"poster",
		"bluray",
		"dvd",
		"netflix",
		"disney plus",
		"prime video"
	],
	"video-oyun": merge(
		["video oyun", "oyun", "konsol", "gamepad", "joystick", "kulaklık"],
		BRANDS.gaming
	),
	"saglik-ve-bakim": [
		"sağlık",
		"bakım",
		"vitamin",
		"termometre",
		"tansiyon",
		"ilk yardım",
		"masaj"
	],
	"yapi-ve-dekorasyon": [
		"yapı",
		"dekorasyon",
		"boya",
		"matkap",
		"vida",
		"alet",
		"tamir",
		"aydınlatma"
	],
	"ayakkabi": merge(
		["ayakkabı", "spor ayakkabı", "bot", "çizme", "terlik", "sandalet"],
		BRANDS.shoes
	),
	"aksesuar": ["aksesuar", "çanta", "kemer", "şapka", "takı", "bileklik", "kolye", "cüzdan"],
	"evcil-hayvan": merge(
		["evcil hayvan", "kedi", "köpek", "mama", "kum", "taşıma çantası", "tasma"],
		BRANDS.pet
	),
	"mutfak": [
		"mutfak",
		"tencere",
		"tava",
		"bıçak",
		"airfryer",
		"blender",
		"kettle",
		"kahve makinesi"
	],
	"takim-elbise": ["takım elbise", "takım", "ceket", "pantolon", "gömlek", "kravat"],
	"temizlik-ve-koruma": ["temizlik", "dezenfektan", "maske", "eldiven", "deterjan", "yumuşatıcı"],
	"dijital-urunler": [
		"dijital",
		"hediye kodu",
		"kod",
		"abonelik",
		"lisans",
		"steam",
		"google play",
		"app store",
		"playstation plus",
		"xbox game pass",
		"netflix"
	],
	"bebek-beslenme": merge(
		["bebek beslenme", "mama", "biberon", "emzik", "mama sandalyesi"],
		BRANDS.baby
	),
	"bisiklet": ["bisiklet", "dağ bisikleti", "yol bisikleti", "kask", "kilit", "pompa", "lastik"],
	"organik-urunler": ["organik", "doğal", "glutensiz", "şekersiz", "vegan"],
	"temizlik-urunleri": [
		"temizlik ürünleri",
		"deterjan",
		"bulaşık",
		"çamaşır",
		"yüzey temizleyici"
	],
	"hediye": [
		"hediye",
		"hediyelik",
		"hediye kartı",
		"doğum günü",
		"yıldönümü",
		"sevgiliye",
		"anneye",
		"babaya"
	],
	"teknoloji": merge(
		["teknoloji", "akıllı ev", "giyilebilir", "aksesuar", "şarj", "kablo", "kulaklık"],
		BRANDS.phone,
		BRANDS.computer,
		BRANDS.smartHome
	),
	"t-shirt": ["tişört", "tshirt", "baskı", "oversize", "basic"],
	"petshop": merge(["petshop", "kedi", "köpek", "mama", "kum", "oyuncak", "tasma"], BRANDS.pet),
	"elektrikli-ev-aletleri": merge(
		[
			"beyaz eşya",
			"buzdolabı",
			"çamaşır makinesi",
			"bulaşık makinesi",
			"fırın",
			"klima",
			"süpürge"
		],
		BRANDS.appliancesTR,
		BRANDS.appliancesGlobal
	),
	"kadin-giyim": merge(
		["kadın giyim", "elbise", "etek", "bluz", "pantolon", "jean", "tişört"],
		BRANDS.clothingTR
	),
	"erkek-giyim": merge(
		["erkek giyim", "gömlek", "pantolon", "jean", "tişört", "ceket"],
		BRANDS.clothingTR
	),
	"kisisel-bakim": merge(
		["kişisel bakım", "şampuan", "sabun", "diş bakımı", "parfüm", "deodorant", "cilt bakım"],
		BRANDS.cosmeticsTR,
		BRANDS.cosmeticsGlobal
	),
	"gida": ["gıda", "atıştırmalık", "kahve", "çay", "çikolata", "kuruyemiş"],
	"saat": ["saat", "kol saati", "akıllı saat", "spor saat"],
	"akilli-ev-sistemleri": merge(
		["akıllı ev", "akıllı priz", "akıllı ampul", "kamera", "alarm", "sensör", "robot süpürge"],
		BRANDS.smartHome
	),
	"arac-ici-aksesuarlar": ["araç içi", "telefon tutucu", "kamera", "paspas", "koku", "şarj"],
	"kucuk-ev-aletleri": merge(
		["küçük ev aletleri", "airfryer", "blender", "tost makinesi", "kettle", "kahve makinesi"],
		BRANDS.appliancesTR,
		BRANDS.appliancesGlobal
	),
	"anne-bebek-bakim": merge(
		["anne bebek bakım", "ıslak mendil", "krem", "şampuan", "pudra"],
		BRANDS.baby
	),
	"kampanya": ["kampanya", "indirim", "fırsat", "kupon", "promosyon", "kodu"],
	"oto-aksesuar": merge(
		["oto aksesuar", "paspas", "koku", "telefon tutucu", "şarj", "bakım"],
		BRANDS.auto
	),
	"kirtasiye-urunleri": [
		"kırtasiye ürünleri",
		"kalem",
		"defter",
		"ajanda",
		"dosya",
		"not defteri"
	],
	"ev-dekorasyon": ["ev dekorasyon", "tablo", "ayna", "mum", "vazo", "duvar dekor", "çerçeve"],
	"motosiklet-aksesuar": merge(
		["motosiklet aksesuar", "kask", "mont", "eldiven", "interkom", "kilit"],
		BRANDS.auto
	)
};

export default CategoriesKeywords;
