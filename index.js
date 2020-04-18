const BitBuffer = require('./bitbuffer')

// Encode takes an array buffer of binary data, and returns an array buffer
// of the RLE+ encoded formatting of that data.
function Encode (buf, bitLength) {
  const runs = runLengths(buf, bitLength)

  const encoded = new BitBuffer(buf.byteLength)
  // Header
  encoded.append(false, 2)
  encoded.append(runs.shift(), 1)
  while (runs.length) {
    encoded.appendRun(runs.shift())
  }

  return encoded.toBuffer()
}

// Decode taeks an array buffer of RLE+ encded data, and returns an array
// buffer of the raw data represented by the RLE+ encoding.
function Decode (buf) {
  const decoded = BitBuffer.From(buf)
  return decoded.Decode()
}

// runLengths transforms an array buffer into an array of run lengths -
// the count of of bits before bit flips. The first element returned is
// a 0 or 1 representing the first bit. The remaining elements are integers
// of how many bits until a flip.
function runLengths (buf, bitLength) {
  if (buf.byteLength === 0) {
    return []
  }
  const byteView = new Uint8Array(buf)
  const runs = [((byteView[0] & 1) === 1) ? 1 : 0]
  let state = ((byteView[0] & 1) === 1)
  let run = 1
  if (!bitLength) {
    bitLength = 8 * byteView.byteLength
  }
  for (let n = 1; n < bitLength; n++) {
    if ((byteView[n >> 3] & (1 << (n % 8))) === 0) {
      if (state === false) {
        run++
      } else {
        state = false
        runs.push(run)
        run = 1
      }
    } else {
      if (state === true) {
        run++
      } else {
        state = true
        runs.push(run)
        run = 1
      }
    }
  }
  runs.push(run)
  return runs
}

module.exports = {
  Encode: Encode,
  Decode: Decode
}
