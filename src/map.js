import * as refs from "./weakrefs.js";

export default class IterableWeakMap extends Map {
	constructor(iterable) {
		super();

		if (iterable) {
			for (const value of iterable) {
				this.add(value);
			}
		}
	}

	get (key) {
		return super.get(refs.get(key));
	}

	has (key) {
		return super.has(refs.get(key));
	}

	set (key, value) {
		return super.set(refs.add(key), value);
	}

	delete (key) {
		return super.delete(refs.get(key));
	}

	*keys () {
		for (const ref of super.keys()) {
			if (refs.isStale(ref)) {
				super.delete(ref);
				continue;
			}

			yield refs.get(ref);
		}
	}

	*entries() {
		for (const key of this.keys()) {
			let value = this.get(key);
			yield [key, value];
		}
	}

	*values() {
		for (const key of this.keys()) {
			yield this.get(key);
		}
	}

	[Symbol.iterator]() {
		return this.entries();
	}

	//  Map.prototype.forEach does not use the iterator protocol or this.values() at all.
	// It walks the internal [[MapData]] list directly.
	// So we need to reimplement it
	forEach (callback, thisArg) {
		for (const [key, value] of this.entries()) {
			callback.call(thisArg, value, key, this);
		}
	}

	get size() {
		let count = 0;

		for (const _ of this.keys()) {
			count++;
		}

		return count;
	}
}
