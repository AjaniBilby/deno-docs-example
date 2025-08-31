type ObjectWithDimensions = { width: number, length: number, height: number };

export class Dimensions {
	private size: [number, number, number];

	constructor(width: number, length: number, height: number)
	constructor(data: ObjectWithDimensions)
	constructor(dataOrWidth?: number | ObjectWithDimensions, length?: number, height?: number) {
		if (typeof dataOrWidth === "number" && typeof length === "number" && typeof height === "number") {
			this.size = [dataOrWidth, length, height];
		} else if (typeof dataOrWidth === "object" && dataOrWidth !== null) {
			this.size = [dataOrWidth.width, dataOrWidth.length, dataOrWidth.height];
		} else {
			this.size = [0, 0, 0];
		}

		this.rotate();
	}

	// Rotate so so height is shortest, then width, then length
	rotate() {
		this.size.sort((a, b) => a-b);
	}

	volume() {
		return this.size[0] * this.size[1] * this.size[2];
	}

	copy() {
		return new Dimensions(this.size[0], this.size[1], this.size[2]);
	}

	canFit(other: Dimensions) {
		if (other.size[0] > this.size[0]) return false;
		if (other.size[1] > this.size[1]) return false;
		if (other.size[2] > this.size[2]) return false;

		return true;
	}

	fit(other: Dimensions) {
		this.size[0] = Math.max(this.size[0], other.size[0]);
		this.size[1] = Math.max(this.size[1], other.size[1]);
		this.size[2] = Math.max(this.size[2], other.size[2]);

		return this;
	}

	truncate() {
		this.size[0] = Math.ceil(this.size[0]);
		this.size[1] = Math.ceil(this.size[1]);
		this.size[2] = Math.ceil(this.size[2]);
	}

	scale(scalar: number) {
		this.size[0] *= scalar;
		this.size[1] *= scalar;
		this.size[2] *= scalar;
	}

	stack(other: Dimensions) {
		this.size[0] += other.size[0];
		this.size[1] = Math.max(this.size[1], other.size[1]);
		this.size[2] = Math.max(this.size[2], other.size[2]);

		this.rotate();
		return this;
	}

	unpack() {
		return {
			width:  this.size[1],
			length: this.size[2],
			height: this.size[0]
		}
	}
}