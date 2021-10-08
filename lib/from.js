import { Buffer } from 'buffer';

import { codes as errorCodes } from '../errors.js';

const {
  ERR_INVALID_ARG_TYPE,
  ERR_STREAM_NULL_VALUES
} = errorCodes;

export default function from(Readable, iterable, opts) {
  let iterator;
  if (typeof iterable === 'string' || iterable instanceof Buffer) {
    return new Readable({
      objectMode: true,
      ...opts,
      read() {
        this.push(iterable);
        this.push(null);
      }
    });
  }

  let isAsync;
  if (iterable && iterable[Symbol.asyncIterator]) {
    isAsync = true;
    iterator = iterable[Symbol.asyncIterator]();
  } else if (iterable && iterable[Symbol.iterator]) {
    isAsync = false;
    iterator = iterable[Symbol.iterator]();
  } else {
    throw new ERR_INVALID_ARG_TYPE('iterable', ['Iterable'], iterable);
  }

  const readable = new Readable({
    objectMode: true,
    highWaterMark: 1,
    // TODO(ronag): What options should be allowed?
    ...opts,
  });

  // Flag to protect against _read
  // being called before last iteration completion.
  let reading = false;

  readable._read = function() {
    if (!reading) {
      reading = true;
      next();
    }
  };

  readable._destroy = function(error, cb) {
    close(error).then(
      () => process.nextTick(cb, error), // nextTick is here in case cb throws
      (e) => process.nextTick(cb, e || error),
    );
  };

  async function close(error) {
    const hadError = (error !== undefined) && (error !== null);
    const hasThrow = typeof iterator.throw === 'function';
    if (hadError && hasThrow) {
      const { value, done } = await iterator.throw(error);
      await value;
      if (done) {
        return;
      }
    }
    if (typeof iterator.return === 'function') {
      const { value } = await iterator.return();
      await value;
    }
  }

  async function next() {
    for (;;) {
      try {
        const { value, done } = isAsync ?
          await iterator.next() :
          iterator.next();

        if (done) {
          readable.push(null);
        } else {
          const res = (value &&
            typeof value.then === 'function') ?
            await value :
            value;
          if (res === null) {
            reading = false;
            throw new ERR_STREAM_NULL_VALUES();
          } else if (readable.push(res)) {
            continue;
          } else {
            reading = false;
          }
        }
      } catch (err) {
        readable.destroy(err);
      }
      break;
    }
  }
  return readable;
}