function BitBuffer(byteCapacity) {
    this.buffer = new ArrayBuffer(byteCapacity);
    this.view = new Uint8Array(this.buffer);
    this.length = 0;
    this.capacity = 8 * byteCapacity;
}

BitBuffer.From = function(buf) {
    let b = new BitBuffer(0);
    b.buffer = buf;
    b.capacity = 8 * buf.byteLength;
    b.length = b.capacity;
    b.view = new Uint8Array(b.buffer);
    return b;
}

BitBuffer.prototype.expand = function() {
    const newBuffer = new ArrayBuffer(this.buffer.byteLength * 2)
    this.view = new Uint8Array(newBuffer);
    this.view.set(this.buffer);
    this.buffer = newBuffer;
    this.capacity *= 2;
}

BitBuffer.prototype.appendBit = function(value) {
    if (!value) {
        this.length++;
        return
    }
    if (this.length > this.capacity) {
        this.expand();
    }
    this.view[this.length / 8] |= (1 << (this.length %8));
    this.length++;
}

BitBuffer.prototype.append = function(value, cnt) {
    while (this.length + cnt > this.capacity) {
        this.expand();
    }

    if (!value) {
        this.length += cnt;
        return
    }
    while (cnt > 0) {
        // optimistically set full bytes while we can.
        if (this.length % 8 == 0 && cnt > 8) {
            this.view[this.length / 8] = -1;
            this.length += 8;
            cnt -= 8;
        } else {
            this.view[this.length / 8] |= (1 << (this.length % 8));
            this.length++;
            cnt--;
        }
    }
}

BitBuffer.prototype.appendRun = function(len) {
    if (len == 1) {
        this.appendBit(1);
    } else if (len < 16) {
        this.appendBit(0);
        this.appendBit(1);
        this.appendBit(len & 1);
        this.appendBit(len & 2);
        this.appendBit(len & 4);
        this.appendBit(len & 8);
    } else {
        this.append(0, 2);
        while (len > 127) {
            this.appendBit(1);
            this.appendBit(len & 1);
            this.appendBit(len & 2);
            this.appendBit(len & 4);
            this.appendBit(len & 8);
            this.appendBit(len & 16);
            this.appendBit(len & 32);
            this.appendBit(len & 64);
            len /= 128;
        }
        this.appendBit(0);
        this.appendBit(len & 1);
        this.appendBit(len & 2);
        this.appendBit(len & 4);
        this.appendBit(len & 8);
        this.appendBit(len & 16);
        this.appendBit(len & 32);
        this.appendBit(len & 64);
    }
}

BitBuffer.prototype.readBit = function(position) {
    return this.view[this.length / 8] & (1 << (this.length % 8));
}

// returns [#bits used to encode the run, length of run]
BitBuffer.prototype.readRun = function(position) {
    if(this.readBit(position)) {
        return [1, 1];
    }
    position++;
    if(this.readBit(position)) {
        // short run.
        return [6, 
            (this.readBit(position++) ? 1 : 0) +
            (this.readBit(position++) ? 2 : 0) + 
            (this.readBit(position++) ? 4 : 0) + 
            (this.readBit(position) ? 8 : 0)]
    }
    // long run.
    position++;
    let more = false;
    let val = 0;
    let bits = 2;
    let msb = 0;
    do {
        bits += 8;
        more = this.readBit(position++);

        if (this.readBit(position++)) {val += (1<<msb);}
        msb++;
        if (this.readBit(position++)) {val += (1<<msb);}
        msb++;
        if (this.readBit(position++)) {val += (1<<msb);}
        msb++;
        if (this.readBit(position++)) {val += (1<<msb);}
        msb++;
        if (this.readBit(position++)) {val += (1<<msb);}
        msb++;
        if (this.readBit(position++)) {val += (1<<msb);}
        msb++;
        if (this.readBit(position++)) {val += (1<<msb);}
        msb++;
    } while (more)
    return [bits, val];
}

BitBuffer.prototype.toBuffer = function() {
    return this.buffer.slice(0, (this.length + 7) / 8);
}

// Decode decodes an RLE encoded buffer into a provided buffer.
// If no buffer is provided, a new one will be allocated.
BitBuffer.prototype.Decode = function() {
    const outBuffer = new BitBuffer(0);
    outBuffer.length = 0;

    if(this.readBit(0) || this.readBit(1)) {
        throw new Error("Invalid version")
    }

    let pos = 2;
    let val = this.readBit(pos++)
    while (pos < this.length) {
        let next = this.readRun(pos);
        pos += next[0];
        outBuffer.append(val, next[1]);
        val = !val;
    }
    return outBuffer.toBuffer();
}

module.exports = BitBuffer;
