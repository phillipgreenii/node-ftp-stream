
var FtpServer = require('ftpd').FtpServer;
var path = require('path');

function runFtpServer(options) {
  options = options || {enableAuth: false};

  var ftpd = new FtpServer('127.0.0.1',{
    getInitialCwd: function () {
      return '/';
    },
    getRoot: function () {
      return path.join(__dirname,  'data');
    },
  });

  ftpd.on('error', function (error) {
    console.error('FTP Server error:', error);
  });

  var connections = [];

  ftpd.on('client:connected', function (connection) {
    connections.push(connection);
    var u;
    connection.on('command:user', function (user, success, failure) {
      u = user;
      if(!options.enableAuth || u === 'user') {
        return success();
      } else {
        return failure('unknown user name' + u);
      }
    });
    connection.on('command:pass', function (pass, success, failure) {
      if(!options.enableAuth || (u === 'user' && pass === 'password')) {
        return success(u);
      } else {
        return failure('incorrect credentials' + u + ":" + pass);
      }
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

module.exports = runFtpServer;
