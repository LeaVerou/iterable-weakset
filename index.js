// Stubs to prevent breakage in older browsers
const WeakRef = globalThis.WeakRef ?? class {
	constructor (value) { this.value = value; }
	deref () { return this.value; }
};

let refs = new WeakMap();

export default class IterableWeakSet extends Set {
	constructor(iterable) {
		super();

		if (iterable) {
			for (const value of iterable) {
				this.add(value);
			}
		}
	}

	add (value) {
		return super.add(getValueOrRef(value));
	}

	has (value) {
		return super.has(getExistingValueOrRef(value));
	}

	delete (value) {
		return super.delete(getExistingValueOrRef(value));
	}

	*values () {
		for (const ref of super.values()) {
			let value = ref;
			if (ref instanceof WeakRef) {
				value = ref.deref();

				if (value === undefined) {
					super.delete(ref);
					continue;
				}
			}

			yield value;
		}
	}

	*keys() {  // same as values()
		yield* this.values();
	}

	*entries() {
		for (const value of this.values()) {
			yield [value, value];
		}
	}

	[Symbol.iterator]() {
		return this.values();
	}

	//  Set.prototype.forEach does not use the iterator protocol or this.values() at all.
	// It walks the internal [[SetData]] list directly.
	// So we need to reimplement it
	forEach (callback, thisArg) {
		for (const value of this.values()) {
			callback.call(thisArg, value, value, this);
		}
	}

	get size() {
		let count = 0;

		for (const _ of this.values()) {
			count++;
		}

		return count;
	}
}


function needsRef (value) {
	return value && (typeof value === "object" || typeof value === "function");
}

function getExistingValueOrRef (value) {
	if (needsRef(value)) {
		return refs.get(value);
	}

	return value;
}

function getValueOrRef (value) {
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
