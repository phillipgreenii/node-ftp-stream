var test = require('tape');
var ftpStream = require('..');
var path = require('path');
var fs = require('fs');
var streamEqual = require('stream-equal');
var FtpServer = require('ftpd').FtpServer;
var through2 = require('through2');
var vinylFs = require('vinyl-fs');

function runFtpServer() {
  //console.log('ears');
  var ftpd = new FtpServer('127.0.0.1',{
    getInitialCwd: function () {
      return '/';
    },
    getRoot: function () {
      return path.join(__dirname,  'data');
    },
  });

    //console.log('nosex');
  ftpd.on('error', function (error) {
    console.error('FTP Server error:', error);
  });

  var connections = [];

    //console.log('earsnose');
  ftpd.on('client:connected', function (connection) {
    connections.push(connection);
    //console.log('client connected: ' + connection.remoteAddress);
    var u;
    connection.on('command:user', function (user, success, failure) {
      //console.log("%%%%%", user);
      u = user;
      success();
    });
    connection.on('command:pass', function (pass, success, failure) {
      success(u);
    });
  });

  ftpd.listen(2100);

  ftpd.completelyShutdown = function() {
    //NOTE: the following lines are a hack to ensure ftpd closes client
    //connections, there seems to be a bug in it\
    connections.forEach(function(c){
      if (c.dataSocket) {
        c.dataSocket.destroy();
      }
      if (c.socket) {
        c.socket.destroy();
      }
      if (c.pasv) {
        c.pasv.close();
      }
    });
    ftpd.close();
  }

  return ftpd;
}


function createDrain() {
  return through2(function(chunk, enc, callback){
    callback();
  });
}



test('stream should contain the correct amount of files (when one file)', function (t) {
  t.plan(2);

  var server = runFtpServer();
  function done(error) {
    t.error(error);
    server.completelyShutdown();
    t.end();
  }

  var file = 'file0.txt';
  var expectedCount = 1;

  var counter = 0;
  ftpStream({port:2100}, file)
  .pipe(through2.obj(function(file, enc, callback){
    file.contents.pipe(createDrain());
    counter++;
    callback();
  }, function(){
    t.equal(counter, expectedCount);
    done();
  })).on('error', done);

});

test('stream should contain the correct contents (when one file)', function (t) {
  t.plan(2);

  var server = runFtpServer();
  function done(error) {
    t.error(error);
    server.completelyShutdown();
    t.end();
  }

  var file = 'file0.txt';
  ftpStream({port:2100}, file)
  .pipe(through2.obj(function(file, enc, callback){
    streamEqual(fs.createReadStream(path.join(__dirname, 'data', 'file0.txt')), file.contents, function(err, equal) {
      t.ok(equal, "Streams for 'file0.txt' are not equal");
      callback();
    });
  }, function(cb){
    done();
    cb();
  })).on('error', done);
});

test('stream should contain the correct amount of files (when array of one file)', function (t) {
  t.plan(2);

  var server = runFtpServer();
  function done(error) {
    t.error(error);
    server.completelyShutdown();
    t.end();
  }

  var files = ['file0.txt'];
  var expectedCount = files.length;

  var counter = 0;
  ftpStream({port:2100}, files)
  .pipe(through2.obj(function(file, enc, callback){
    file.contents.pipe(createDrain());
    counter++;
    callback();
  }, function(){
    t.equal(counter, expectedCount);
    done();
  })).on('error', done);

});

test('stream should contain the correct contents (when array of one file)', function (t) {
  t.plan(2);

  var server = runFtpServer();
  function done(error) {
    t.error(error);
    server.completelyShutdown();
    t.end();
  }

  var files = ['file0.txt'];
  ftpStream({port:2100}, files)
  .pipe(through2.obj(function(file, enc, callback){
    streamEqual(fs.createReadStream(path.join(__dirname, 'data', 'file0.txt')), file.contents, function(err, equal) {
      t.ok(equal, "Streams for 'file0.txt' are not equal");
      callback();
    });
  }, function(cb){
    done();
    cb();
  })).on('error', done);
});

test('stream should contain the correct amount of files (when array of multiple files)', function (t) {
  t.plan(2);

  var server = runFtpServer();
  function done(error) {
    t.error(error);
    server.completelyShutdown();
    t.end();
  }

  var files = ['/file0.txt', '/dir1/file1.txt', '/dir2/file2.txt'];
  var expectedCount = files.length;

  var counter = 0;
  ftpStream({port:2100}, files)
  .pipe(through2.obj(function(file, enc, callback){
    file.contents.pipe(createDrain());
    counter++;
    callback();
  }, function(){
    t.equal(counter, expectedCount);
    done();
  })).on('error', done);

});

test('stream should contain the correct contents (when array of multiple files)', function (t) {
  t.plan(4);

  var server = runFtpServer();
  function done(error) {
    t.error(error);
    server.completelyShutdown();
    t.end();
  }

  var files = ['/file0.txt', '/dir1/file1.txt', '/dir2/file2.txt'];
  var counter = 0;
  var f;
  ftpStream({port:2100}, files)
  .pipe(through2.obj(function(file, enc, callback){
    if(counter == 0) {
      f = path.join(__dirname, 'data', 'file0.txt');
    } else if(counter == 1) {
      f = path.join(__dirname, 'data', 'dir1', 'file1.txt');
    } else if(counter == 2) {
      f = path.join(__dirname, 'data', 'dir2', 'file2.txt');
    }
    streamEqual(fs.createReadStream(f), file.contents, function(err, equal) {
      t.ok(equal, "Streams for '"+files[counter]+"' are not equal");
      callback();
    });
    counter++;
  }, function(cb){
    done();
    cb();
  })).on('error', done);
});
