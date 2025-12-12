# Weak Iterables

WeakSets and WeakMaps are awesome, but also have limitations.

This library exposes a `WeakSet` and `WeakMap` class that utilize weak references yet support iteration, including `size`, `forEach()`, `entries()`, `keys()`, `values()` etc.

Additionally, they allow you to mix objects and primitives and it just works.

## How does it work?

`IterableWeakSet` is a subclass of `Set` that uses `WeakRef` objects under the hood to store the values.
`IterableWeakMap` is a subclass of `Map` that uses `WeakRef` objects under the hood to store the keys.
They intercept all relevant methods to unwrap the weakrefs when read from the outside and remove any values that have been garbage collected.

## Caveats

As a result, this means things like `.size` or iterator values may change between calls, as the garbage collector works its magic.
That’s why the built-in objects are not designed this way!
