# Iterable WeakSet

WeakSets are awesome, but also have limitations.

This library exposes a `WeakSet` class that utilizes weak references yet supports iteration, including `size`, `forEach()`, `entries()`, `keys()`, `values()` etc.

Additionally, it allows you to mix objects and primitives and it just works. For primitives, it just works like a normal `Set`.

## How does it work?

`IterableWeakSet` is a subclass of `Set` that uses `WeakRef` objects under the hood to store the values.
It intercepts all methods to unwrap the weakrefs when read from the outside and remove any from the set when they are garbage collected.

## Caveats

As a result, this means things like `.size` or iterator values may change between calls, as the garbage collector works its magic.
