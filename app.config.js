const IS_DEV = process.env.APP_VARIANT === "development";

export default {
	"name": "AtSepete",
	"slug": "atsepete",
	"version": "1.2.1",
	"orientation": "portrait",
	"icon": "./assets/images/icon.png",
	"scheme": "atsepete",
	"userInterfaceStyle": "automatic",
	"newArchEnabled": true,
	"ios": {
		"supportsTablet": true,
		"bundleIdentifier": "com.anonymous.atsepete",
		"infoPlist": {
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
				"ios": {}
			}
		],
		[
			"expo-camera",
			{
				"recordAudioAndroid": false
			}
		],
		"expo-font",
		"expo-web-browser",
		"@react-native-google-signin/google-signin",
		[
			"react-native-share",
			{
				"ios": ["fb", "instagram", "twitter", "tiktoksharesdk"],
				"android": [
					"com.facebook.katana",
					"com.instagram.android",
					"com.twitter.android",
					"com.zhiliaoapp.musically"
				],
				"enableBase64ShareAndroid": true
			}
		],
		[
			"expo-media-library",
			{
				// iOS: add-only message (needed for saving)
				savePhotosPermission: "QR kodunu galeriye kaydetmek için izin gerekir.",

				// Android: don't add READ_MEDIA_IMAGES/VIDEO/AUDIO
				granularPermissions: [],

				// Android: don't request ACCESS_MEDIA_LOCATION either
				isAccessMediaLocationEnabled: false
			}
		]
	],
	"experiments": {
		"typedRoutes": true
	},
	"runtimeVersion": "1.1.0",
	"updates": {
		"url": "https://u.expo.dev/d06355ea-e79c-4ea1-90b1-cfaee031fd22"
	},
	"extra": {
		"router": {
			"origin": false
		},
		"eas": {
			"projectId": "cab9e15f-3e8e-4179-8432-d0e2dc1ee84c"
		}
	}
};
