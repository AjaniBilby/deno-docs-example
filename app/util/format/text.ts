import { isLetterPattern } from '~/util/format/letters.ts';


/**
 * Segments a string based on sequential character matching from a search term.
 *
 * This function analyzes a string and identifies which characters sequentially match
 * each character in the search term (in order, one-to-one). Each character from the
 * search term can only be matched once. The matching is case-insensitive.
 *
 * @param str - The input string to analyze and segment
 * @param search - The search term whose characters to match sequentially
 * @param weak - If true, allows partial matches; if false, requires all search characters to be matched
 * @returns An array of segments, each containing a `match` boolean and `str` portion.
 *          Returns empty array if `weak` is false and not all search characters are matched.
 *          Returns single non-matching segment if search is empty.
 *
 * @example
 * ```ts
 * // Sequential matching - each search char matched once
 * GetMatchingSegments("aabbcc", "abc")
 * // Returns: [
 * //   { match: true, str: "a" },    // matches first 'a' from search
 * //   { match: false, str: "a" },   // second 'a' doesn't match (already used)
 * //   { match: true, str: "b" },    // matches 'b' from search
 * //   { match: false, str: "b" },   // second 'b' doesn't match
 * //   { match: true, str: "c" },    // matches 'c' from search
 * //   { match: false, str: "c" }    // second 'c' doesn't match
 * // ]
 *
 * // Partial match with weak=true
 * GetMatchingSegments("Hi", "hello", true)
 * // Returns: [
 * //   { match: true, str: "H" },    // matches 'h' from search
 * //   { match: false, str: "i" }    // 'i' doesn't match next char 'e'
 * // ]
 *
 * // Partial match with weak=false (default) - returns empty
 * GetMatchingSegments("Hi", "hello")
 * // Returns: [] (not all search characters were matched)
 * ```
 */
export function GetMatchingSegments(str: string, search: string, weak = false) {
	if (search.length === 0 ) return [{ match: false, str }];
	type Segment = { match: boolean, str: string };
	function SegmentPush(segments: Segment[], match: boolean, str: string) {
		const last = segments[segments.length-1];
		if (last && last.match === match) last.str += str;
		else segments.push({ match, str });
	}

	const segments: Segment[] = [];

	let cursor = 0;
	let i = 0;
	for (; i<str.length && cursor < search.length;) {
		if (str[i].toLowerCase() === search[cursor].toLowerCase()) {
			SegmentPush(segments, true, str[i]);
			cursor++;
			i++
			continue;
		}

		SegmentPush(segments, false, str[i]);
		i++;
	}

	if (cursor !== search.length && !weak) return [];

	if (i < str.length) SegmentPush(segments, false, str.slice(i));

	return segments;
}




const SQL_MUST_ESCAPE = ['\\', '_', '%'];

/**
 * Converts a string into a SQL LIKE pattern for segment-based matching.
 *
 * This function creates a pattern where each character in the input string
 * can match anywhere in a database field, with wildcards between characters.
 * Special SQL LIKE characters (\, _, %) are escaped with backslashes.
 *
 * @param str - The input string to convert to a LIKE pattern
 * @returns A SQL LIKE pattern string with % wildcards, or just '%' if input is empty/falsy
 *
 * @example
 * ```ts
 * DbSegmentMatching("abc")     // Returns: "%a%b%c%"
 * DbSegmentMatching("a_b")     // Returns: "%a%\_%b%"
 * DbSegmentMatching("test%")   // Returns: "%t%e%s%t%\%%"
 * DbSegmentMatching("")        // Returns: "%"
 * ```
 */
export function DbSegmentMatching(str: string) {
	if (!str) return '%';

	let out = '%';
	for (let i=0; i<str.length; i++) {
		if (SQL_MUST_ESCAPE.includes(str[i])) out += '\\';
		out += str[i] + '%';
	}

	return out;
}

/**
 * Adds spaces before capital letters in camelCase strings to make them more readable.
 *
 * This function inserts a space before each uppercase letter that follows a lowercase letter,
 * effectively converting camelCase to "space separated" format while preserving the original
 * capitalization.
 *
 * @param str - The camelCase string to add spaces to
 * @returns The string with spaces inserted before capital letters that follow lowercase letters
 *
 * @example
 * ```ts
 * SpaceCamelCase("camelCase")        // Returns: "camel Case"
 * SpaceCamelCase("XMLHttpRequest")   // Returns: "XMLHttp Request"
 * SpaceCamelCase("iPhone")           // Returns: "i Phone"
 * SpaceCamelCase("HTML")             // Returns: "HTML"
 * SpaceCamelCase("a")                // Returns: "a"
 * ```
 */
export function SpaceCamelCase(str: string): string {
	let out = str[0];
	for (let i=1; i<str.length; i++) {
		const curr = str.charCodeAt(i);
		if (65 <= curr && curr <= 90) { // capital letter
			const prev = str.charCodeAt(i-1);
			if ( 97 <= prev && prev <= 122 ) { // lower case
				out += ' ';
			}
		}

		out += str[i];
	}

	return out;
}

/**
 * Capitalizes the first letter after word boundaries in a string.
 *
 * This function uses a regular expression pattern to find and capitalize letters
 * that appear at the beginning of words. The exact behavior depends on the
 * `isLetterPattern` regex which should match word boundaries followed by letters.
 *
 * @param str - The string to capitalize
 * @returns The string with first letters of words capitalized
 *
 * @example
 * ```ts
 * // Assuming isLetterPattern matches word boundaries + letters:
 * Capitalize("hello world")     // Returns: "Hello World"
 * Capitalize("test-case")       // Returns: "Test-Case"
 * Capitalize("multi word text") // Returns: "Multi Word Text"
 * ```
 *
 * @remarks
 * This function depends on the `isLetterPattern` regex variable being defined
 * in the same scope. The pattern should capture a word boundary and the following letter.
 */
export function Capitalize(str: string): string {
	return str.replace(isLetterPattern, function (s, m1, m2) { return m1 + m2.toUpperCase(); });
}




export function CleanMacAddress(str: string) {
	str = str.toUpperCase();

	switch (str[2]) {
		case ':': {
			if (!/^([0-9A-F]{2}[:]){5}([0-9A-F]{2})$/.test(str)) return null;
			return str.replaceAll(':', '-');
		}
		case '-': {
			if (!/^([0-9A-F]{2}[-]){5}([0-9A-F]{2})$/.test(str)) return null;
			return str;
		}
		default: {
			if (!/^[0-9A-Fa-f]{12}$/.test(str)) return null;

			let out = '';
			for (let i=0; i<12; i+=2) {
				if (i !== 0) out += '-';
				out += str.slice(i, i+2);
			}

			return out;
		}
	}
}




/**
 * Cuts a string at the nth occurrence of a pivot string and returns both parts.
 *
 * @param str - The string to cut
 * @param pivot - The substring to search for as the cutting point
 * @param offset - Which occurrence to cut at (1 = first, 2 = second, -1 = last, -2 = second-to-last, etc.)
 * @returns A tuple containing [beforePivot, afterPivot]. If pivot is not found, returns [str, ""]
 *
 * @example
 * ```ts
 * CutString("a-b-c-d", "-", 1)  // ["a", "b-c-d"]
 * CutString("a-b-c-d", "-", 2)  // ["a-b", "c-d"]
 * CutString("a-b-c-d", "-", -1) // ["a-b-c", "d"]
 * CutString("a-b-c-d", "x", 1)  // ["a-b-c-d", ""]
 * ```
 */
export function CutString(str: string, pivot: string, offset = 1): [string, string] {
	const idx = CutStringIndex(str, pivot, offset);
	return [str.slice(0, idx), str.slice(idx+pivot.length)]
}

/**
 * Finds the index of the nth occurrence of a pivot string within a string.
 *
 * @param str - The string to search in
 * @param pivot - The substring to search for
 * @param offset - Which occurrence to find (1 = first, 2 = second, -1 = last, -2 = second-to-last, etc.)
 * @returns The index of the specified occurrence, or str.length if not found or offset is 0
 *
 * @example
 * ```ts
 * CutStringIndex("a-b-c-d", "-", 1)  // 1
 * CutStringIndex("a-b-c-d", "-", 2)  // 3
 * CutStringIndex("a-b-c-d", "-", -1) // 5
 * CutStringIndex("a-b-c-d", "x", 1)  // 7 (str.length)
 * ```
 */
export function CutStringIndex(str: string, pivot: string, offset = 1): number {
	if (offset === 0) return str.length;

	if (offset > 0) {
		let cursor = 0;
		while (offset !== 0) {
			const i = str.indexOf(pivot, cursor);
			if (i === -1) return str.length;
			cursor = i+1;
			offset--;
		}
		cursor--;

		return cursor;
	}

	if (offset < 0) {
		let cursor = str.length;
		while (offset !== 0) {
			const i = str.lastIndexOf(pivot, cursor);
			if (i === -1) return str.length;
			cursor = i-1;
			offset++;
		}
		cursor++;

		return cursor;
	}

	return str.length;
}




export function GenerateGUID(): string {
	return 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		const r = Math.random() * 16 | 0;
		const v = c === 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	}).toUpperCase();
}