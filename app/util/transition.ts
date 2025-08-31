/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ViewTransition) */
interface ViewTransition {
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ViewTransition/finished) */
	readonly finished: Promise<undefined>;
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ViewTransition/ready) */
	readonly ready: Promise<undefined>;
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ViewTransition/updateCallbackDone) */
	readonly updateCallbackDone: Promise<undefined>;
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ViewTransition/skipTransition) */
	skipTransition(): void;
}

export function StartViewTransition() {
	if (typeof document !== "object") return;

	return new Promise<ViewTransition | null>((res) => {
		if (typeof document.startViewTransition !== "function") return res(null);

		const trans = document.startViewTransition(() => {
			res(trans as ViewTransition);
		});
	});
}