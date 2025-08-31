// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AssertUnreachable(x: never): never {
	throw new Error("Unreachable code path reachable");
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function WarnUnreachable(x: never, msg: string) {
	console.warn(msg);
}

export type Prettify<T> = {
	[K in keyof T]: T[K];
// eslint-disable-next-line @typescript-eslint/ban-types
} & unknown;

export type JsonWeakened<T> = T extends Date
	? string
	: T extends Array<infer U>
	? Array<JsonWeakened<U>>
	: T extends object
	? { [K in keyof T]: JsonWeakened<T[K]> }
	: T;



export function GetClientIPAddress(request: Request) {
	return request.headers.get("X-Real-IP") || "0.0.0.0";
}


export function FuzzyStringMatch(str: string | null | undefined, search: string): boolean {
	if (!str) return !search;

	let cursor = 0;
	for (let i=0; i<str.length && cursor < search.length; i++) {
		if (str[i].toLowerCase() === search[cursor].toLowerCase()) cursor++;
	}

	return cursor === search.length;
}

export function IsLetterMatching(str: string, search: string) {
	if (search.length === 0) return true;

	let cursor = 0;
	for (let i=0; i<str.length && cursor < search.length;) {
		const a = str.charCodeAt(i);
		const b = search.charCodeAt(cursor);
		if (a === b) {
			cursor++;
			i++
			continue;
		}

		const A = !("A".charCodeAt(0) <= a && a <= "Z".charCodeAt(0));
		if (A) {
			i++
			continue;
		}

		const B = !("A".charCodeAt(0) <= b && b <= "Z".charCodeAt(0));
		if (B) {
			cursor++;
			continue;
		}

		return false;
	}

	return cursor === search.length;
}


export function IsClient() {
	return typeof window === "object";
}

export function IsServer() {
	return typeof window !== "object";
}


export function ArrayEqual<T extends ArrayLike<number>>(arr1: T, arr2: T) {
	if (arr1.length !== arr2.length) return false;

	for (let i=0; i<arr1.length; i++) if (arr1[i] !== arr2[i]) return false;

	return true;
}

export function ParseURL(url: string | null | undefined) {
	if (url === undefined) return null;
	if (url === null) return null;

	try {
		return new URL(url)
	} catch (e) {
		return null;
	}
}


export function IsEmpty(data: object | Array<unknown> | null | undefined) {
	if (data === undefined) return true;
	if (data === null) return true;

	if (typeof data !== "object") return false;

	if (Array.isArray(data)) return data.length !== 0;

	for (const _ in data) return false;

	return true;
}

export function CaughtPromise<T>(promise: Promise<T>): Promise<{ ok?: T; err?: unknown }> {
	return new Promise((res) => promise
		.then ((t) => res({ ok: t,         err: undefined }))
		.catch((e) => res({ ok: undefined, err: e         }))
	)
}