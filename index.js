const BitBuffer = require('./bitbuffer');

function Encode(buf) {
    const runs = runLengths(buf);
  
    console.log(JSON.stringify(runs));
    const encoded = new BitBuffer(buf.byteLength);    
    // Header
    encoded.append(false, 2);
    encoded.append(runs.shift(), 1);
    while (runs.length) {
        encoded.appendRun(runs.shift())
    }

    return encoded.toBuffer();
}

function Decode(buf) {
    const decoded = BitBuffer.From(buf);
    return decoded.Decode();
}

// transform the buffer into an array of number of bits before bit flips
// first element return'd is a 0 or 1 representing the first bit,
// remaining elements are integers of how many bits until a flip.
function runLengths(buf) {
    if (buf.byteLength == 0) {
        return [];
    }
    const byteView = new Uint8Array(buf);
    let runs = [(byteView[0] & 1 == 1) ? 1 : 0];
    let state = (byteView[0] & 1 == 1) ? true : false;
    let run = 1;
    for (let n = 1; n < 8 * byteView.byteLength; n++) {
        if ((byteView[n >> 3] & (1 << (n % 8))) == 0) {
            if (state == false) {
                run++;
            } else {
                state = false;
                runs.push(run);
                run = 1;
            }
        } else {
            if (state == true) {
                run++;
            } else {
                state = true;
                runs.push(run);
                run = 1;
            }
        }
    }
    runs.push(run);
    return runs
}

module.exports = {
    Encode: Encode,
    Decode: Decode,
};
