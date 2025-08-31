export class AutoFocusClaim {
	#claimed: boolean;
	constructor () { this.#claimed = false; }

	claim () {
		if (this.#claimed) return false;

		this.#claimed = true;
		return true;
	}
}