#!/usr/bin/env mocha

/*
 * This is a node.js based compatibility layer for RNFS used as a basis for
 * replicating functionality. This ensures the real implemention can be as
 * node-like as possible.
 **/

"use strict";

const fs = require('fs.extra');
const path = require('path');
const mkdirp = require('mkdirp');
const bluebird = require('bluebird');

const RNFS = {
  DocumentDirectoryPath: path.join(__dirname, '..', 'tmp'),
  readFile: bluebird.promisify(fs.readFile),
  writeFile: bluebird.promisify(fs.writeFile),
  appendFile: bluebird.promisify(fs.appendFile),
  readdir: bluebird.promisify(fs.readdir),
  stat: bluebird.promisify(fs.stat),
  unlink: bluebird.promisify(fs.rmrf),
  copyFile: bluebird.promisify(fs.copy),
  moveFile: bluebird.promisify(fs.move),
  mkdir: (file) => { return bluebird.promisify(fs.mkdirp)(file).then(() => { }) },
  exists: (file) => new Promise((resolve, reject) => {
    fs.exists(file, exists => {
      return resolve(exists);
    });
  })
};

require('./rnfs.spec.js')(describe, beforeEach, it, RNFS);
