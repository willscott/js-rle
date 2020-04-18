const crypto = require('crypto');
const rle = require('../');
const bb = require('../bitbuffer')
const assert = require('assert');


describe('RLE', () => {
  it('should round trip random bytes', (done) => {
    crypto.randomBytes(256, (err, buf) => {
      assert.equal(err, undefined);

      let enc = rle.Encode(buf.buffer);
      let dec = rle.Decode(enc);
      assert.deepEqual(buf.buffer, dec);
      done();
    });
  });

  it('should match the reference test vector', () => {
    // Encoding bitvec![LittleEndian; 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
	  // in the Rust reference implementation gives an encoding of [223, 145, 136, 0] (without version field)
    const bitsRaw = Uint8Array.from([117, 248, 255, 15]);
    // https://github.com/filecoin-project/go-bitfield/blob/master/rle/rleplus_test.go#L16-L17
    const rleEncoded = Uint8Array.from([124, 71, 34, 2]);

    let enc = rle.Encode(bitsRaw.buffer, 28);
    assert.deepEqual(enc, rleEncoded.buffer);
  
    let dec = rle.Decode(rleEncoded.buffer);
    assert.deepEqual(dec, bitsRaw.buffer);
  });
});
