/**
 * Utilities to manage a 1-1 mapping of values to WeakRefs.
 */

/**
 * Stub for WeakRef to prevent breakage in older browsers.
 */
export const WeakRef = globalThis.WeakRef ?? class {
	constructor (value) { this.value = value; }
	deref () { return this.value; }
};

const refs = new WeakMap();

/**
 * Returns the value itself for primitives or a WeakRef if it exists for objects.
 * @param {*} value - The value to get the reference for.
 * @returns {WeakRef|*} The WeakRef instance if the value needs a ref, otherwise the value itself.
 */
export function get (value) {
	if (needsRef(value)) {
		return refs.get(value);
	}

	return value;
}

/**
 * Returns the value itself for primitives and dereferences it if it's a WeakRef.
 * @param {WeakRef|*} value - The value to dereference.
 * @returns {*} The value itself or the dereferenced value.
 */
export function deref (value) {
	if (value instanceof WeakRef) {
		return value.deref();
	}

	if (needsRef(value)) {
		return get(value)?.deref();
	}

	return value;
}

/**
 * Gets the WeakRef for a value, creating one if it doesn't exist.
 * @param {*} value - The value to get or create a reference for.
 * @returns {WeakRef|*} The WeakRef instance if the value needs a ref, otherwise the value itself.
 */
export function add (value) {
	if (needsRef(value)) {
		let ref = refs.get(value);

		if (!ref) {
			ref = new WeakRef(value);
			refs.set(value, ref);
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
export function isStale (value) {
	if (!refs.has(value)) {
		return false;
	}

	let ref = refs.get(value);
	return ref.deref() === undefined;
}

/**
 * Determines if a value needs to be wrapped in a WeakRef.
 * Only objects and functions need weak references; primitives can be stored directly.
 * @param {*} value - The value to check.
 * @returns {boolean} True if the value needs a WeakRef, false otherwise.
 */
export function needsRef (value) {
	return value && (typeof value === "object" || typeof value === "function");
}
