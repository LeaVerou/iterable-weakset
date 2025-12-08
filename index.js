// Stubs to prevent breakage in older browsers
const FinalizationRegistry = globalThis.FinalizationRegistry ?? class { register() { } };
const WeakRef = globalThis.WeakRef ?? class {
	constructor (value) { this.value = value; }
	deref () { return this.value; }
};

export default class IterableWeakSet extends Set {
	#registry = new FinalizationRegistry(ref => {
		// Remove the WeakRef wrapper when its target is GC'd
		super.delete(ref);
	});

	constructor(iterable) {
		super();

		if (iterable != null) {
			for (const value of iterable) {
				this.add(value);
			}
		}
	}

	add (value) {
		let ref = value;

		if (value && (typeof value === "object" || typeof value === "function")) {
			ref = new WeakRef(value);

			// Use WeakRef itself as unregister token
			this.#registry.register(value, ref, ref);
		}

		return super.add(ref);
	}

	#getRef (value) {
		if (super.has(value)) {
			return null;
		}

		for (const ref of this.values()) {
			if (ref instanceof WeakRef && ref.deref() === value) {
				return ref;
			}
		}

		return null;
	}

	#getValue (value) {
		if (super.has(value)) {
			return value;
		}

		return this.#getRef(value);
	}

	has (value) {
		if (super.has(value)) {
			return true;
		}

		return Boolean(this.#getRef(value));
	}

	delete (value) {
		return super.delete(this.#getValue(value));
	}

	*values () {
		for (const ref of super.values()) {
			const target = ref.deref();

			if (target === undefined) {
				super.delete(ref);
			}
			else {
				yield target;
			}
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
