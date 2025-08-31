export type RGB = [number, number, number];
export function Hex2RGB (hex: string): RGB {
	let offset = hex[0] === "#" ? 1 : 0;

	const rgb: number[] = [];
	for (let i=0; i<3; i++) {
		const val = parseInt(hex.slice(offset, offset+2), 16);
		rgb.push(val);
		offset += 2;
	}

	return rgb as RGB;
}

export function Rgb2Hex(rgb: RGB) {
	return "#"
		+ rgb[0].toString(16)
		+ rgb[1].toString(16)
		+ rgb[2].toString(16);
}


export function Luminance(rgb: RGB) {
	const a = rgb.map((v) => {
		v /= 255;
		return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
	});
	return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function AdjustLuminance(rgb: RGB, amount: number): RGB {
	return rgb.map(v => Math.min(
		Math.max(0, v + amount),
		255)
	) as RGB;
}


export function RandomColor() {
	return "#"
		+ Math.floor(Math.random()*255).toString(16).padStart(2, "0")
		+ Math.floor(Math.random()*255).toString(16).padStart(2, "0")
		+ Math.floor(Math.random()*255).toString(16).padStart(2, "0");
}

export type ThemeColor = "zinc" | "slate" | "stone" | "gray" | "neutral"
	| "red" | "rose" | "orange" | "green" | "blue" | "yellow" | "violet";
export function ThemeColorStyle(color: ThemeColor) {
	return {
		color: `hsl(var(--${color}-foreground))`,
		backgroundColor: `hsl(var(--${color}))`,
	}
}