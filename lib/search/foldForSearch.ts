import transliterate from "@sindresorhus/transliterate";

export function foldForSearch(input: string) {
	return transliterate(input)
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.trim();
}
