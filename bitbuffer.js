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
            this.view[this.length / 8] |= (1 << (this.length % 8))
            this.length++;
            cnt--;
        }
    }
}

BitBuffer.prototype.appendRun = function(len) {
    if (len == 1) {
        this.append(1, 1);
    } else if (len < 16) {
        this.append(0, 1);
        this.append(1, 1);
        this.append(len & 8, 1);
        this.append(len & 4, 1);
        this.append(len & 2, 1);
        this.append(len & 1, 1);
    } else {
        this.append(0, 2);
        while (len > 127) {
            this.append(1, 1);
            this.append(len & 1, 1);
            this.append(len & 2, 1);
            this.append(len & 4, 1);
            this.append(len & 8, 1);
            this.append(len & 16, 1);
            this.append(len & 32, 1);
            this.append(len & 64, 1);
            len /= 128;
        }
        this.append(0, 1);
        this.append(len & 1, 1);
        this.append(len & 2, 1);
        this.append(len & 4, 1);
        this.append(len & 8, 1);
        this.append(len & 16, 1);
        this.append(len & 32, 1);
        this.append(len & 64, 1);
    }
}

BitBuffer.prototype.buffer = function() {
    return this.buffer.slice(0, (this.length + 7) / 8)
}
