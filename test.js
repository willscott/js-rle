const crypto = require('crypto');
const rle = require('./');
const bb = require('./bitbuffer')

let x = new bb(0)
x.append(0,2)
x.append(1,1)
x.appendRun(127)

crypto.randomBytes(8, (err, buf) => {
  if (err) throw err;
  let enc = rle.Encode(buf.buffer);
  let dec = rle.Decode(enc);
  if (buf.byteLength != dec.byteLength) {
      throw new Error("round trip length wrong.");
  }
});

