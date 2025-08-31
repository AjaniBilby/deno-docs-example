export function TimeToISO(time?: string) {
	const now = new Date().toISOString();
	if (!time) return now;

	return now.split('T')[0] + 'T' + time;
}



/**
 * Creates a Date object, fallback to current date on failure.
 *
 * @param date - Optional date input as string or Date object
 * @returns A valid Date object - either parsed from input or current date as fallback
 *
 * @example
 * ```ts
 * WeakDate()                    // Returns: new Date() (current date/time)
 * WeakDate("2023-12-25")        // Returns: Date object for Dec 25, 2023
 * WeakDate(new Date())          // Returns: the same Date object
 * WeakDate("invalid-date")      // Returns: new Date() (current date/time)
 * WeakDate(null)                // Returns: new Date() (current date/time)
 * ```
 */
export function WeakDate(date?: string | Date | null): Date {
	if (!date) return new Date();
	if (date instanceof Date) return date;

	try {
		return new Date(date);
	} catch (_e) {
		return new Date();
	}
}



/**
 * Calculates the check digit for an SSCC (Serial Shipping Container Code).
 *
 * This function implements the GS1 check digit algorithm for SSCC codes.
 * It takes the last 17 digits of the input, applies alternating multipliers
 * (3 and 1 from right to left), sums the results, and calculates the check
 * digit needed to make the total a multiple of 10.
 *
 * @param sscc - The SSCC string (uses last 17 characters)
 * @returns The calculated check digit (0-9)
 *
 * @example
 * ```ts
 * SSCCCheckDigit("12345678901234567")    // Returns: calculated check digit
 * SSCCCheckDigit("00012345678901234567") // Uses last 17 digits: "12345678901234567"
 * ```
 *
 * @remarks
 * - Only the last 17 characters of the input string are used
 * - The algorithm follows GS1 standards for SSCC check digit calculation
 * - Input should contain only numeric characters for proper calculation
 */
export function SSCCCheckDigit(sscc: string) {
	const digits = sscc.slice(-17).split('').map(x => Number(x));
	let sum = 0;
	for (let i=0; i<digits.length; i++) {
		const j = digits.length - i - 1;
		const mul = j % 2 === 0 ? 3 : 1;

		sum += digits[i] * mul;
	}
	const rounded = Math.ceil(sum / 10) * 10;

	return rounded-sum;
}


export function IsValidRegex(pattern: string): boolean {
	try{
		new RegExp(pattern);
		return true;
	} catch (_e) {
		return false;
	}
}


/**
 * Template literal tag function for generating ZPL (Zebra Programming Language) code.
 *
 * This function processes template literals to create properly formatted ZPL commands
 * by cleaning up whitespace/newlines in the template and escaping special characters
 * in interpolated values. It normalizes line breaks and escapes ZPL special characters
 * (backslash and caret) in the interpolated values.
 *
 * @param strings - The template string parts
 * @param values - The interpolated values to insert and escape
 * @returns A properly formatted ZPL command string
 *
 * @example
 * ```ts
 * const text = "Hello\nWorld";
 * const zpl = ZPL`
 *   ^XA
 *   ^FO100,100
 *   ^FD${text}^FS
 *   ^XZ
 * `;
 * // Returns: "^XA\n^FO100,100\n^FDHello\\nWorld^FS\n^XZ"
 *
 * const special = "Text with ^ and \\ chars";
 * const zpl2 = ZPL`^FD${special}^FS`;
 * // Returns: "^FDText with \\^ and \\\\ chars^FS"
 * ```
 *
 * @remarks
 * - Normalizes `\r\n` and indented newlines to single `\n`
 * - Escapes backslashes (`\`) and carets (`^`) in interpolated values
 * - Converts actual newlines in values to ZPL newline escape sequence (`\\n`)
 * - Trims leading/trailing whitespace from final result
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ZPL(strings: TemplateStringsArray, ...values: any[]): string {
	return strings.reduce((acc, str, i) => {
		str = str.replace(/\r\n|(\n\s+)/g, '\n');

		return i < values.length
			? acc + str + String(values[i])
				.replace(/([\\^])/g, '\\$1')   // Escape backslash and caret
				.replace(/\r\n|\n|\r/g, '\\n') // Replace newlines with ZPL newline
			: acc + str;
	}, '').trim();
}



export function BufferStartsWith(buffer: BufferSource, target: Uint8Array): boolean {
	if (buffer.byteLength < target.byteLength) return false;

	const bufferArray = buffer instanceof ArrayBuffer
		? new Uint8Array(buffer)
		: new Uint8Array(buffer.buffer);

	for (let i = 0; i<target.length; i++) {
		if (bufferArray[i] !== target[i]) return false;
	}

	return true;
}

export function BufferEndsWith(buffer: BufferSource, target: Uint8Array): boolean {
	if (buffer.byteLength < target.byteLength) return false;

	const bufferArray = buffer instanceof ArrayBuffer
		? new Uint8Array(buffer)
		: new Uint8Array(buffer.buffer);

	for (let i=1; i<=target.length; i++) {
		if (bufferArray[bufferArray.length-i] !== target[target.length-i]) return false;
	}

	return true;
}