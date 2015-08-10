var stream = require('stream');
var util = require('util');

util.inherits(FailingReadStream, stream.Readable);

function FailingReadStream(opt) {
  stream.Readable.call(this, opt);
  this.hasRead = false;
}

FailingReadStream.prototype._read = function() {
  console.error('read called');
  if(!this.hasRead) {
    this.hasRead = true;
    this.push('potatoes');
  } else {
    this.emit('error', new Error('there was an error'));
  }
};

function createFailingReadStream() {
  return new FailingReadStream();
}

function dummyOpen(filename, mode, callback) {
  console.error('dummyOpen', filename, mode);
  setImmediate(callback, null, {});
}

var alwaysFailFs = {
  createReadStream: createFailingReadStream,
  open: dummyOpen
};

module.exports = alwaysFailFs;
