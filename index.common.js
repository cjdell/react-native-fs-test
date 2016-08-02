/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
'use strict';

var React = require('react');
var ReactNative = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Image,
} = ReactNative;

var RNFS = require('react-native-fs');

var spec = require('./test/rnfs.spec.js');

var testImage1Path = RNFS.DocumentDirectoryPath + '/test-image-1.jpg';
var downloadUrl = 'http://epic.gsfc.nasa.gov/epic-archive/jpg/epic_1b_20151118094121_00.jpg';
var downloadLargeUrl = 'http://ipv4.download.thinkbroadband.com/100MB.zip';
var downloadRedirectUrl = 'http://buz.co/rnfs/download-redirect.php';
var uploadUrl1 = 'http://buz.co/rnfs/upload-tester.php';

var downloadHeaderUrl = 'http://buz.co/rnfs/download-tester.php';
var downloadHeaderPath = RNFS.DocumentDirectoryPath + '/headers.json';

var jobId1 = -1, jobId2 = -1;

var RNFSApp = React.createClass({
  getInitialState: function () {
    return {
      output: 'Doc folder: ' + RNFS.DocumentDirectoryPath,
      imagePath: {
        uri: ''
      }
    };
  },

  mochaTest: function () {
    const tests = [];
    let beforeEachCallback;
    let log = '';

    const describe = (name, callback) => {
      callback();
    };

    const beforeEach = (callback) => {
      beforeEachCallback = callback;
    };

    const it = (name, callback) => {
      tests.push({ name, callback });
    };

    const fail = (name, err) => {
      console.warn(name, err.message);
    };

    const pass = (name) => {
      console.log(name);
      log += `${name}\n`;
      this.setState({ output: log });
    };

    spec(describe, beforeEach, it, RNFS);

    let currentTest = Promise.resolve();

    tests.forEach((test) => {
      try {
        currentTest = currentTest.then(() => {
          return beforeEachCallback().then(() => {
            return test.callback();
          }).then(() => {
            pass(test.name);
          }).catch(err => {
            fail(test.name, err);
          });
        });
      } catch (err) {
        fail(test.name, err);
      }
    });
  },

  downloadFileTest: function (background, url) {
    var progress = data => {
      var percentage = ((100 * data.bytesWritten) / data.contentLength) | 0;
      var text = `Progress ${percentage}%`;
      this.setState({ output: text });
    };

    var begin = res => {
      jobId1 = res.jobId;
    };

    var progressDivider = 1;

    RNFS.downloadFile({ fromUrl: url, toFile: testImage1Path, begin, progress, background, progressDivider }).then(res => {
      this.setState({ output: JSON.stringify(res) });
      this.setState({ imagePath: { uri: 'file://' + testImage1Path } });
    }).catch(err => this.showError(err));
  },

  stopDownloadTest: function () {
    RNFS.stopDownload(jobId1);
    RNFS.stopDownload(jobId2);
  },

  uploadFileTest: function () {
    var progress1 = data => {
      var text = JSON.stringify(data);
      this.setState({ output: text });
    };

    var begin1 = res => {
      jobId1 = res.jobId;
    };

    var options = {
      toUrl: uploadUrl1,
      files: [{ name: 'myfile', filename: 'thing.jpg', filepath: testImage1Path, filetype: 'image/jpeg' }],
      beginCallback: begin1,
      progressCallback: progress1
    };

    RNFS.uploadFiles(options).then(res => {
      var response = JSON.parse(res.body);

      this.assert('Upload should have name', response.myfile.name, 'thing.jpg');
      this.assert('Upload should have type', response.myfile.type, 'image/jpeg');
      this.assert('Upload should have size', response.myfile.size, 312428);

      this.setState({ output: JSON.stringify(res) });
    }).catch(err => this.showError(err))
  },

  downloadHeaderTest: function () {
    var headers = {
      'foo': 'Hello',
      'bar': 'World'
    };

    // Download the file then read it, it should contain the headers we sent
    RNFS.downloadFile({ fromUrl: downloadHeaderUrl, toFile: downloadHeaderPath, headers }).then(res => {
      return RNFS.readFile(downloadHeaderPath, 'utf8');
    }).then(content => {
      var headers = JSON.parse(content);

      this.assert('Should contain header for foo', headers['HTTP_FOO'], 'Hello');
      this.assert('Should contain header for bar', headers['HTTP_BAR'], 'World');

      this.setState({ output: content });
    }).catch(err => this.showError(err));
  },

  assert: function (name, val, exp) {
    if (exp !== val) throw new Error(name + ': "' + String(val) + '" should be "' + String(exp) + '"');
    this.setState({ output: name });
  },

  getFSInfoTest: function () {
    return RNFS.getFSInfo().then(info => {
      this.setState({ output: JSON.stringify(info) });
    });
  },

  appendTest: function () {
    var f1 = RNFS.DocumentDirectoryPath + '/f1';
    var f2 = RNFS.DocumentDirectoryPath + '/f2';

    return Promise.resolve().then(() => {
      return RNFS.unlink(f1).then(() => { }, () => void 0 /* Ignore error */);
    }).then(() => {
      return RNFS.unlink(f2).then(() => { }, () => void 0 /* Ignore error */);
    }).then(() => {
      return RNFS.writeFile(f1, 'foo © bar 𝌆 baz', 'utf8');
    }).then(() => {
      return RNFS.appendFile(f1, 'baz 𝌆 bar © foo', 'utf8');
    }).then(() => {
      return RNFS.appendFile(f2, 'baz 𝌆 bar © foo', 'utf8');
    }).then(() => {
      return RNFS.readFile(f1, 'utf8').then(contents => {
        this.assert('Read F1', contents, 'foo © bar 𝌆 bazbaz 𝌆 bar © foo');
      });
    }).then(() => {
      return RNFS.readFile(f2, 'utf8').then(contents => {
        this.assert('Read F2', contents, 'baz 𝌆 bar © foo');
      });
    }).then(() => {
      this.assert('Tests Passed', true, true);
    }).catch(err => this.showError(err));
  },

  showError: function (err) {
    this.setState({ output: `ERROR: Code: ${err.code} Message: ${err.message}` });
  },

  render: function () {
    return (
      <View style={styles.container} collapsable={false}>
        <View style={styles.panes}>
          <View style={styles.leftPane}>
            <TouchableHighlight onPress={this.mochaTest}>
              <View style={styles.button}>
                <Text style={styles.text}>Mocha Test</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={this.downloadFileTest.bind(this, false, downloadUrl) }>
              <View style={styles.button}>
                <Text style={styles.text}>DL File</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={this.downloadFileTest.bind(this, true, downloadUrl) }>
              <View style={styles.button}>
                <Text style={styles.text}>DL File (BG) </Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={this.downloadFileTest.bind(this, false, downloadRedirectUrl) }>
              <View style={styles.button}>
                <Text style={styles.text}>DL File (302) </Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={this.downloadFileTest.bind(this, false, downloadLargeUrl) }>
              <View style={styles.button}>
                <Text style={styles.text}>DL File (Big) </Text>
              </View>
            </TouchableHighlight>
          </View>

          <View style={styles.rightPane}>
            <TouchableHighlight onPress={this.stopDownloadTest}>
              <View style={styles.button}>
                <Text style={styles.text}>Stop Download</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={this.uploadFileTest}>
              <View style={styles.button}>
                <Text style={styles.text}>Upload File</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={this.downloadHeaderTest}>
              <View style={styles.button}>
                <Text style={styles.text}>DL Headers</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={this.getFSInfoTest}>
              <View style={styles.button}>
                <Text style={styles.text}>Get FS Info</Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
        <View>
          <Text style={styles.text}>{this.state.output}</Text>

          <Image style={styles.image} source={this.state.imagePath}></Image>
        </View>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  panes: {
    flexDirection: 'row',
  },
  leftPane: {
    flex: 1,
  },
  rightPane: {
    flex: 1,
  },
  button: {
    height: 32,
    backgroundColor: '#CCCCCC',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    margin: 10,
  },
  image: {
    width: 100,
    height: 100,
  },
});

AppRegistry.registerComponent('ReactNativeFSTest', () => RNFSApp);
