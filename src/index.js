'use strict';

var debug = require('debug')('ftp-stream');
var deferred = require('deferred-stream');
var FtpClient = require('ftp');
var File = require('vinyl');
var async = require('async');

function _streamFtpGet(ftpConnectOptions, files, deferredStream) {
      var c = new FtpClient();
      c.on('ready', function() {
        debug('ready to download %s', files);

        var getCalls = files.map(function(filePath){
          return function(callback) {
            debug('GETting `%s`', filePath);

            c.get(filePath, function(err, stream) {
              if (err) {
                debug('failed to get `%s`: %s',filePath, err.message);
                deferredStream.emit('error', err);
                callback(err);
                return;
              }
              debug('got `%s`', filePath);

              //NOTE: this enforcment of one GET at a time is due to a bug in
              // ftp that doesn't handle sockets correctly when GETing multiple filess
              stream.on('error',function(e){
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
