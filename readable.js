import { addAbortSignal } from './lib/add-abort-signal.js';
import compose from './lib/compose.js';
import { destroyer } from './lib/destroy.js';
import Duplex from './lib/duplex.js';
import eos from './lib/end-of-stream.js';
import PassThrough from './lib/passthrough.js';
import pipeline from './lib/pipeline.js';
import * as promises from './lib/promises.js';
import Readable from './lib/readable.js';
import Transform from './lib/transform.js';
import { isDisturbed } from './lib/utils.js';
import Writable from './lib/writable.js';

import { promisify } from 'util';

export default Readable;
export {
  isDisturbed,
  Readable as Stream,
  Readable,
  Writable,
  Duplex,
  Transform,
  PassThrough,
  pipeline,
  addAbortSignal,
  eos as finished,
  destroyer as destroy,
  compose,
  promises,
};

Object.defineProperty(pipeline, promisify.custom, {
  enumerable: true,
  get() {
    return promises.pipeline;
  }
});

Object.defineProperty(eos, promisify.custom, {
  enumerable: true,
  get() {
    return promises.finished;
  }
});
