import IterableWeakSet from "../index.js";
import check from "htest.dev/check";

let obj = {a: 1};
let symbol = Symbol("bar");
let fn = () => {};
let params = [1, "foo", obj, null, symbol, fn];

let tests = [
	{
		map (value) {
			return [...value];
		},
	},
	{
		check: check.is("IterableWeakSet"),
	}
];

export default {
	run (arg) {
		let transform, iterable = params;
		if (typeof arg === "function") {
			transform = arg;
		}
		else {
			iterable = arg;
		}

		let set = new IterableWeakSet(iterable);
		if (transform) {
			set = transform(set);
		}
		return set;
	},
	expect: params,
	tests: [
		{
			name: "size",
			expect: { size: 3 },
		},
		{
			name: "Iterator values",
			tests: [
				{},
				{
					arg: set => set.values(),
					tests,
				},
				{
					arg: set => set.keys(),
					tests,
				},
				{
					arg: set => set.union(new Set([1])),
					tests,
				}
			]
		}
	]
}
