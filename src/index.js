'use strict';

var debug = require('debug')('ftp-stream');
var deferred = require('deferred-stream');
var FtpClient = require('ftp');
var File = require('vinyl');
var async = require('async');

function _streamFtpGet(ftpConnectOptions, files, deferredStream) {
      var c = new FtpClient();
      c.on('error', function(e) {
		if(e.code === 530) {
			e = new Error('Credentials are not correct');
		}
		deferredStream.emit('error', e);
	});

      c.on('ready', function() {
        debug('ready to download %s', files);

        var getCalls = files.map(function(filePath){
          return function(callback) {
            debug('GETting `%s`', filePath);

            c.get(filePath, function(err, stream) {
              if (err) {
                if(err.code === 550) {
                  debug('File not found: %s', filePath);
                  err = new Error("File Not Found: " + filePath)
                }
                deferredStream.emit('error', err);
                return callback(err);
              }
              debug('got `%s`', filePath);

              stream.on('error',function(e){
                debug('Error transfering `%s`: %s', filePath, e);
                callback(e);
              });
              stream.on('end',function(){
                callback();
              });

              deferredStream.write(new File({
                path: filePath,
                contents: stream
              }));
            });
          };
        });

        //NOTE: as far as I can tell, FTP only supports on GET at a time
        // on a single connection, so this enforces that.
        async.series(getCalls, function(err){
          if(!err) {
            deferredStream.end();
          }
          c.end();
        });

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
