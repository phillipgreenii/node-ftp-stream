'use strict';

var debug = require('debug')('ftp-stream');
var deferred = require('deferred-stream');
var FtpClient = require('ftp');
var File = require('vinyl');

function _streamFtpGet(ftpConnectOptions, files, deferredStream) {
      var c = new FtpClient();
      c.on('ready', function() {
        debug('ready to download %s', files);

        var filesRemaining = files.length;

        files.forEach(function(filePath){
          debug('GETting `%s`', filePath);

          c.get(filePath, function(err, stream) {
            if (err) {
              debug('failed to get `%s`: %s',filePath, err.message);
              deferredStream.emit('error', err);
              return;
            }
            debug('got `%s`', filePath);

            deferredStream.write(new File({
              path: filePath,
              contents: stream
            }));
            filesRemaining--;

            if(filesRemaining <= 0) {
              deferredStream.end();
            }
           });
        });

        c.end();
      });

      c.connect(ftpConnectOptions);
}

function ftpStream(ftpConnectOptions, files) {
  //adjust for optional ftpConnectOptions
  if(!files){
    files = ftpConnectOptions;
    ftpConnectOptions = null;
  }
  //ensure files specified
  if(!files) {
    throw new Error('`files` must be specified');
  }
  //ensure array
  if(!Array.isArray(files)) {
    files = [files];
  }

  return deferred({objectMode: true},function(deferredStream) {
    _streamFtpGet(ftpConnectOptions, files, deferredStream);
  });
}

module.exports = ftpStream;
