import { resolveMx } from "node:dns/promises";

import { CutString } from "~/util/format/text.ts";

export type WeakAddress = {
	name:     string;
	business?: string | null;
	email?:    string | null;
	phone?:    string | null;

	line1?:    string | null;
	line2?:    string | null;
	line3?:    string | null;
	lines?:    string[] | null;

	suburb:   string;
	postcode: string;
	state:    string;
	country?: string | null;
};

export async function ValidateEmail(str: unknown) {
	if (typeof str !== "string") return;

	if (str.length > 320) return `Max length 320 characters`;

	const [ user, domain ] = CutString(str, "@");
	if (user.length < 1) return `Missing email username`;
	if (domain.length < 1) return `Missing email domain name`;

	try {
		const res = await resolveMx(domain);
		if (res.length < 1) return "domain has no mail server";
	} catch (e) {
		return "domain has no mail server";
	}

	return;
}


export async function ValidatedAddress(data: Partial<WeakAddress>, prefix?: string) {
	return false;
}