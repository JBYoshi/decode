# Decode

Decode anything.

## Internals

Each decoder is represented by a file in the "decoders" directory. Every decoder is called in turn on every value.

Decoders primarily operate on basic types, particularly strings, Uint8Arrays representing bytes, and JavaScript primitive types. If a decoder produces a more complicated type (like JSON objects or arrays), the decoder should also handle representing those types. This is done so that the decoders can control how their containers are represented.
