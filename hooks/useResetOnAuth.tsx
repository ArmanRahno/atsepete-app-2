import { createContext, useContext } from "react";

type ResetOnAuthContext = { bumpResetOnAuthEpoch: () => void };
export const ResetOnAuthContext = createContext<ResetOnAuthContext | null>(null);

export function useResetOnAuth() {
	const ctx = useContext(ResetOnAuthContext);
	if (!ctx) throw new Error("useResetOnAuth must be used within ResetOnAuthContext.Provider");
	return ctx;
}
