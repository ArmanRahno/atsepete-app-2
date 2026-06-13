import { useMemo } from "react";
import Fuse from "fuse.js";
import type { FuseResultMatch } from "fuse.js";
import { foldForSearch } from "@/lib/search/foldForSearch";

export type FuseListResult<T> = {
	item: T;
	score?: number;
	matches?: FuseResultMatch[];
};

export function useFuseFilteredList<T>(args: {
	items: T[];
	query: string;
	keys: { name: keyof T; weight?: number }[];
	threshold?: number;
	limit?: number;
}) {
	const { items, query, keys, threshold = 0.35, limit = 50 } = args;

	const fuse = useMemo(() => {
		return new Fuse(items, {
			includeScore: false,
			includeMatches: true,
			ignoreLocation: true,
			threshold,
			keys: keys.map(k => ({ name: String(k.name), weight: k.weight }))
		});
	}, [items, keys, threshold]);

	const results = useMemo<FuseListResult<T>[]>(() => {
		const q = foldForSearch(query);
		if (!q) return items.map(item => ({ item }));

		return fuse.search(q, { limit }).map(r => ({
			item: r.item,
			matches: r.matches
		}));
	}, [items, fuse, query, limit]);

	return results;
}
