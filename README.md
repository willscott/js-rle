# JS-RLE

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
![Node.js CI](https://github.com/willscott/js-rle/workflows/Node.js%20CI/badge.svg)

A Javascript implementation of the RLE+ Spec.
See: https://github.com/filecoin-project/specs/blob/master/data-structures.md#rle-bitset-encoding

## Install

```
npm install js-rle
```

## Usage

```javascript
const RLE = require('js-rle');

let encoded = RLE.Encode(buffer);
let decoded = RLE.Decode(encoded);
```
The interface expects the JS `ArrayBuffer` type.

## Maintainers

[@willscott](https://github.com/willscott).

## Contributing

Feel free to dive in! [Open an issue](https://github.com/willscott/js-rle/issues/new) or submit PRs.

## License

[MIT](LICENSE) © Will Scott
