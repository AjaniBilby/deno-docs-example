export function Truncate(x: number, digits: number = 1) {
	if (digits < 1) return Math.trunc(x);

	const m = 10 ** digits;
	return Math.trunc(x * m) / m;
}


export function AlignUpInteger(x: number, multiple: number) {
	if (multiple === 0) return x;

	const remainder = x % multiple;
	return remainder !== 0
		? x + (multiple - remainder)
		: x;
}

export function AlignDownInteger(x: number, multiple: number) {
	if (multiple === 0) return x;

	const remainder = x % multiple;
	return remainder !== 0
		? x - remainder
		: x;
}

export function RoundToEven(n: number): number {
	if (n < 0) return -RoundToEven(-n);

	const trunc = Math.trunc(n);
	const frac  = n - trunc;

	if (frac > 0.5) return trunc + 1;
	if (frac < 0.5) return trunc;

	if (trunc % 2.0 === 0.0) return trunc;
	return trunc + 1;
}

export function RoundTowardsZero(n: number): number {
	return n < 0 ? Math.ceil(n) : Math.floor(n);
}

export function Clamp(x: number, min: number, max: number) {
	if (x < min) return min;
	if (x > max) return max;
	return x;
}

export function SafeInteger(value: number, fallback: number) {
	if (!Number.isSafeInteger(value)) return fallback;
	return value;
}

export function SafeQueryInteger(url: URLSearchParams, key: string, fallback: number) {
	if (!url.has(key)) return fallback;
	return SafeInteger(Number(url.get(key) || ""), fallback);
}

/**
 * Both sets must include no duplicates and be sorted in the same order
 */
export function IsSortedSuperSet<T> (sup: T[], base: T[]): boolean {
	let i = 0; let j = 0;
	while (i < sup.length && j < base.length) {
		if (sup[i] == base[j]) {
			i++; j++;
			continue;
		}

		i++;
	}

	return j >= base.length;
}

/**
 * The permission arrays must be sorted, and not include duplicates
 */
export function CompareSortedSets<T>(a: T[], b: T[]): 1 | 0 | -1 | null {
	const A = IsSortedSuperSet<T>(a, b);
	const B = IsSortedSuperSet<T>(b, a);

	const idx = Number(A) | (Number(B) << 1);
	return COMPARE_SETS_LOOKUP[idx] || null;
}
const COMPARE_SETS_LOOKUP = [
	null, // !A && !B
	1,    //  A && !B
	-1,   // !A &&  B
	0,    //  A &&  B
] as const;





export class QuickHash {
	public hash: number;

	constructor () {
		this.hash = 0;
	}

	push (val: number) {
		this.hash = (this.hash << 5) - this.hash + val;
		this.hash |= 0; // Convert to 32-bit integer
	}

	string (str: string) {
		for (let i = 0; i < str.length; i++) this.push(str.charCodeAt(i));
	}

	result () { return this.hash; }

	static string(str: string) {
		const t = new QuickHash();
		t.string(str);
		return t.result();
	}
}

export class Hash72 extends QuickHash {
	override push (val: number) {
		this.hash = (this.hash + val) % 1296
	}
}

const blank = new RegExp("^\\s*$");
export function EstimateDelimiter(str: string) {
	const lines = str
		.split("\n")
		.filter(x => !blank.test(x))
		.map(CharacterCharCodeFrequency);

	// Calculate total frequency
	const histogram = new Map<number, number>();
	for (const line of lines) {
		for (const [char, count] of line) {
			histogram.set(char, (histogram.get(char) || 0) + count );
		}
	}

	// normalize
	for (const key of histogram.keys()) {
		const total = histogram.get(key) || 1;
		const avg = total / lines.length;
		histogram.set(key, avg);
	}

	const options = new Array<number>();
	outer: for (const code of histogram.keys()) {
		// ignore characters
		if (48 <= code && code <= 57 ) continue; // 0-9
		if (65 <= code && code <= 132) continue; // A-Z
		if (97 <= code && code <= 122) continue; // a-z
		if (code == 95) continue;                // _
		if (code === 32) continue;               // space

		for (const line of lines) {
			const expect = histogram.get(code) || 0;
			if (line.get(code) !== expect) continue outer;
		}

		options.push(code);
	}

	// use the most used first
	options.sort((a, b) => (histogram.get(b) || 0) - (histogram.get(a) || 0));


	if (options.length === 0) return null;

	return String.fromCharCode(options[0]);
}

export function CharacterCharCodeFrequency(str: string) {
	const map = new Map<number, number>();

	for (let i=0; i<str.length; i++) {
		const c = str.charCodeAt(i);
		const t = map.get(c) || 0;
		map.set(c, t+1)
	}

	return map;
}


export function CalculateDelimiterColumns(str: string, delimiter: string) {
	let max = 0;
	let tally = 1;

	for (let i=0; i<str.length; i++) {
		if (str[i] === delimiter) tally++;
		else if (str[i] === "\n") {
			max = Math.max(tally, max);
			tally = 1;
		}
	}

	return max;
}



export function BinarySearchIndex<T>(arr: T[], compare: (v: T) => -1 | 0 | 1): number {
	let s = 0;
	let e = arr.length-1;

	while (s < e) {
		const span = Math.floor((e-s) / 2);
		if (span === 0) break;

		const m = s + span;
		const cmp = compare(arr[m]);
		if (cmp === 0) return m;

		if (cmp < 0) e = m;
		else s = m;
	}

	const cmp = compare(arr[s]);
	if (cmp === 0) return s;

	if (s !== e) {
		const cmp = compare(arr[e]);
		if (cmp === 0) return e;
	}

	return -1;
}

export function BinarySearch<T>(arr: T[], compare: (v: T) => -1 | 0 | 1) {
	const i = BinarySearchIndex(arr, compare);
	if (i === -1) return null;

	return arr[i];
}