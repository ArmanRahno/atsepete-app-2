const IS_DEV = process.env.APP_VARIANT === "development";
const BUILD_DATE = new Intl.DateTimeFormat("tr-TR", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
	timeZone: "Europe/Istanbul"
}).format(new Date());

export default {
	"name": "AtSepete",
	"slug": "atsepete",
	"version": "1.3.6",
	"orientation": "portrait",
	"icon": "./assets/images/icon.png",
	"scheme": "atsepete",
	"userInterfaceStyle": "automatic",
	"newArchEnabled": true,
	"ios": {
		"supportsTablet": true,
		"bundleIdentifier": "com.atsepete.atsepete",
		"googleServicesFile": "GoogleService-Info.plist",
		"usesAppleSignIn": true,
		"infoPlist": {
			"CFBundleAllowMixedLocalizations": true,
			"CFBundleDevelopmentRegion": "tr",
			"CFBundleLocalizations": ["tr", "en"],
			"LSApplicationQueriesSchemes": ["fb", "instagram", "twitter", "tiktoksharesdk"],
			"ITSAppUsesNonExemptEncryption": false
		}
	},
	"android": {
		"adaptiveIcon": {
			"foregroundImage": "./assets/images/adaptive-icon.png",
			"backgroundColor": "#ffffff"
		},
		"googleServicesFile": "./google-services.json",
		"package": "com.anonymous.atsepete",
		"blockedPermissions": [
			"android.permission.RECEIVE_BOOT_COMPLETED",
			"android.permission.SYSTEM_ALERT_WINDOW",
			"android.permission.WAKE_LOCK",
			"android.permission.VIBRATE",
			"android.permission.RECORD_AUDIO",

			"android.permission.READ_EXTERNAL_STORAGE",
			"android.permission.WRITE_EXTERNAL_STORAGE",
			"android.permission.READ_MEDIA_IMAGES",
			"android.permission.READ_MEDIA_VIDEO",
			"android.permission.READ_MEDIA_AUDIO",
			"android.permission.READ_MEDIA_VISUAL_USER_SELECTED",
			"android.permission.ACCESS_MEDIA_LOCATION"
		]
	},
	"web": {
		"bundler": "metro",
		"output": "static",
		"favicon": "./assets/images/favicon.png"
	},
	"plugins": [
		"expo-router",
		"expo-status-bar",
		[
			"expo-splash-screen",
			{
				"image": "./assets/images/splash-icon.png",
				"imageWidth": 200,
				"resizeMode": "contain",
				"backgroundColor": "#7c3aed"
			}
		],
		[
			"expo-build-properties",
			{
				"android": {},
				"ios": {
					"extraPods": [
						{
							"name": "GoogleUtilities",
							"modular_headers": true
						},
						{
							"name": "RecaptchaInterop",
							"modular_headers": true
						}
					]
				}
			}
		],
		[
			"expo-camera",
			{
				"cameraPermission":
					"Kamera erişimi, ürün barkodlarını tarayıp At Sepete’de ürün ve fiyat bilgilerini göstermek için gereklidir. Ambalajdaki barkodu okutarak ilgili ürünü bulabilirsiniz.",
				"microphonePermission": false,
				"recordAudioAndroid": false
			}
		],
		"expo-font",
		"expo-web-browser",
		"expo-apple-authentication",
		"@react-native-google-signin/google-signin"
	],
	"experiments": {
		"typedRoutes": true
	},
	"runtimeVersion": "1.3.6",
	"updates": {
		"url": "https://u.expo.dev/d06355ea-e79c-4ea1-90b1-cfaee031fd22"
	},
	"extra": {
		"buildDate": process.env.EXPO_PUBLIC_BUILD_DATE || BUILD_DATE,
		"router": {
			"origin": false
		},
		"eas": {
			"projectId": "cab9e15f-3e8e-4179-8432-d0e2dc1ee84c"
		}
	}
};
