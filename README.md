# Decode

Decode anything.

## Internals

Each decoder is represented by a file in the "decoders" directory. Every decoder is called in turn on every value.

Types of values supported:

- String
- Number (may be strings; not automatically converted)
- Bytes, as Uint8Array
- Plain objects
- Standard arrays

This system is built using ECMAScript modules, which may not work over file:/// URLs. To develop with them, you can use the Python web server:

```bash
python3 -m http.server <port>
```
