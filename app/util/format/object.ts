// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TrimUndefined(val: any[] | { [ key: string ]: any }) {
	if (Array.isArray(val)) {
		for (const elm of val) TrimUndefined(elm);
		return;
	}

	for (const key in val) {
		if (val[key] === undefined) delete val[key];
		if (typeof val[key] === 'object') TrimUndefined(val[key]);
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SortObject<T extends Record<string, any>>(obj: T, order?: string[]) {
	const out: T = {} as T;
	const keys = Object.keys(obj) as (keyof T)[];
	keys.sort(order ? (a,b) => {
		const strA = String(a);
		const strB = String(b);
		const diff = order.indexOf(strA) - order.indexOf(strB);
		if (diff !== 0) return diff;

		return strA.localeCompare(strB);
	} : undefined);

	for (const key of keys) {
		out[key] = obj[key];
	}

	return out;
}