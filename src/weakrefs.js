
/**
 * Polyfill for WeakRef if not available in the environment.
 * Falls back to a simple wrapper that holds a strong reference.
 * @type {typeof globalThis.WeakRef}
 */
export const WeakRef = globalThis.WeakRef ?? class {
	constructor (value) { this.value = value; }
	deref () { return this.value; }
};

const refs = Symbol("refs");

/**
 * Manages a mapping of values to WeakRefs
 */
export default class WeakRefs {
	/** @private */
	[refs] = new WeakMap();

	/**
	 * Returns the value itself for primitives or a WeakRef if it exists for objects.
	 * @param {*} value - The value to get the reference for.
	 * @returns {WeakRef|*} The WeakRef instance if the value needs a ref, otherwise the value itself.
	 */
	get (value) {
		if (WeakRefs.needsRef(value)) {
			return this[refs].get(value);
		}

		return value;
	}

	/**
	 * Gets the WeakRef for a value, creating one if it doesn't exist.
	 * @param {*} value - The value to get or create a reference for.
	 * @returns {WeakRef|*} The WeakRef instance if the value needs a ref, otherwise the value itself.
	 */
	add (value) {
		if (WeakRefs.needsRef(value)) {
			let ref = this[refs].get(value);

			if (!ref) {
				ref = new WeakRef(value);
				this[refs].set(value, ref);
			}

			return ref;
		}

		return value;
	}

	/**
	 * Checks if a value's weak reference is stale (the referenced object has been garbage collected).
	 * @param {*} value - The value to check.
	 * @returns {boolean} True if the reference is stale, false otherwise (not garbage collected, not an object, not present).
	 */
	isStale (value) {
		if (!this[refs].has(value)) {
			return false;
		}

		let ref = this[refs].get(value);
		return ref.deref() === undefined;
	}

	/**
	 * Determines if a value needs to be wrapped in a WeakRef.
	 * Only objects and functions need weak references; primitives can be stored directly.
	 * @param {*} value - The value to check.
	 * @returns {boolean} True if the value needs a WeakRef, false otherwise.
	 */
	static needsRef (value) {
		return value && (typeof value === "object" || typeof value === "function");
	}
}
