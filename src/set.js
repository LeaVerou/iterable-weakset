import * as refs from "./weakrefs.js";

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
		return super.add(refs.add(value));
	}

	has (value) {
		return super.has(refs.get(value));
	}

	delete (value) {
		return super.delete(refs.get(value));
	}

	*values () {
		for (const ref of super.values()) {
			if (refs.isStale(ref)) {
				super.delete(ref);
				continue;
			}

			yield refs.deref(ref);
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
