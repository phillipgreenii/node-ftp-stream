# ftp-stream

This is a wraps `ftp` to provide a streaming interface for downloading files via FTP.

##Install

```shell
npm install ftp-stream --save
```

##Usage

`ftpStream([ftpConnectOptions], files)`

###ftpConnectOptions
Type: `Object`

The connect options passed to [ftp.connect()](https://github.com/mscdex/node-ftp#methods).


###files
Type: `array` of `String`

An array of files to download.



## Example

###Download `README.txt` from `localhost` on port `21` as `anonymous`
```javascript
var fs = require('vinyl-fs');
var ftpStream = require('ftm-stream');

ftpStream(['README.txt'])
.pipe(fs.dest('./output'));
```

###Download `secret.txt` from `ftp.secret.info` on port `1234` as `walter`
```javascript
var fs = require('vinyl-fs');
var ftpStream = require('ftm-stream');

var connectionInfo = {
  host: 'ftp.secret.info',
  user: 'walter',
  port: 1234
};

ftpStream(connectionInfo,['secret.txt'])
.pipe(fs.dest('./output'));
```

## License
Copyright (c) 2015, Phillip Green II. Licensed under the MIT license.
