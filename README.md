# ftp-stream
[![npm version](https://badge.fury.io/js/ftp-stream.svg)](http://badge.fury.io/js/ftp-stream)
[![Build Status](https://travis-ci.org/phillipgreenii/node-ftp-stream.svg)](https://travis-ci.org/phillipgreenii/node-ftp-stream)
[![Code Climate](https://codeclimate.com/github/phillipgreenii/node-ftp-stream/badges/gpa.svg)](https://codeclimate.com/github/phillipgreenii/node-ftp-stream)
[![david-dm](https://david-dm.org/phillipgreenii/node-ftp-stream.svg)](https://david-dm.org/phillipgreenii/node-ftp-stream)
[![Test Coverage](https://codeclimate.com/github/phillipgreenii/node-ftp-stream/badges/coverage.svg)](https://codeclimate.com/github/phillipgreenii/node-ftp-stream/coverage)

This is wraps `ftp` to provide a streaming interface for downloading files via FTP.

## Install

```shell
npm install ftp-stream --save
```

## Usage

`ftpStream([ftpConnectOptions], files)`

### ftpConnectOptions
Type: `Object`

The connect options passed to [ftp.connect()](https://github.com/mscdex/node-ftp#methods).


### files
Type: `array` of `String`

An array of files to download.



## Example

### Download `README.txt` from `localhost` on port `21` as `anonymous`
```javascript
var fs = require('vinyl-fs');
var ftpStream = require('ftp-stream');

ftpStream(['README.txt'])
.pipe(fs.dest('./output'));
```

### Download `secret.txt` from `ftp.secret.info` on port `1234` as `walter`
```javascript
var fs = require('vinyl-fs');
var ftpStream = require('ftp-stream');

var connectionInfo = {
  host: 'ftp.secret.info',
  user: 'walter',
  port: 1234
};

ftpStream(connectionInfo,['secret.txt'])
.pipe(fs.dest('./output'));
```

## Releasing
Travis has been configured to publish upon tagged commits; run the following for npm to update the version and push the appropriate commits to trigger a deploy from Travis.

```bash
npm version
```

## License
Copyright (c) 2015, Phillip Green II. Licensed under the MIT license.
