type Payload = {
	type?: string;
	path?: string;
	route?: string;
	slug?: string;
};

function toSegments(input: string): string[] {
	const parts = input.split("/");
	const segs: string[] = [];

	for (const part of parts) {
		const trimmed = part.trim();

		if (trimmed && trimmed !== ".") segs.push(trimmed);
	}
	return segs;
}

function ensureLeadingSlash(segments: string[]): string {
	return "/" + segments.join("/");
}

export function pathFromPayload(payload: Payload): string | null {
	if (!payload || payload.type !== "NAVIGATE") return null;

	if (typeof payload.path === "string" && payload.path.trim()) {
		const segs = toSegments(payload.path);

		if (segs.length === 0) return null;

		const joined = ensureLeadingSlash(segs);

		if (joined.startsWith("http://") || joined.startsWith("https://")) return null;

		if (joined.indexOf("..") !== -1) return null;

		return joined;
	}

	if (typeof payload.route === "string" && payload.route.trim()) {
		const segs = toSegments(payload.route);

		if (typeof payload.slug === "string" && payload.slug.trim()) {
			const slugSegs = toSegments(payload.slug);

			for (const s of slugSegs) segs.push(s);
		}

		if (segs.length === 0) return null;

		const joined = ensureLeadingSlash(segs);

		if (joined.startsWith("http://") || joined.startsWith("https://")) return null;

		if (joined.indexOf("..") !== -1) return null;

		return joined;
	}

	return null;
}
