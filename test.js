const crypto = require('crypto');
const rle = require('./');

crypto.randomBytes(256, (err, buf) => {
  if (err) throw err;
  let enc = rle.Encode(buf);
  let dec = rle.Decode(enc);
  if (buf.byteLength != dec.byteLength) {
      throw new Error("round trip length wrong.");
  }
});
