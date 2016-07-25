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

var testDir1Path = RNFS.DocumentDirectoryPath + '/test-dir-1';
var testFile1Path = RNFS.DocumentDirectoryPath + '/test-dir-1/test-file-1';
var testFile2Path = RNFS.DocumentDirectoryPath + '/test-dir-1/test-file-2';

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

  mkdirTest: function () {
    return RNFS.mkdir(testDir1Path).then(() => {
      this.setState({ output: 'Directory created' });
    }).catch(err => this.showError(err));
  },
  writeNestedTest: function () {
    return RNFS.writeFile(testFile1Path, 'I am a file in the directory', 'ascii').then(() => {
      this.setState({ output: 'Files written successfully' });
    }).catch(err => this.showError(err));
  },
  readNestedTest: function () {
    return RNFS.readFile(testFile1Path).then((data) => {
      this.setState({ output: 'Contents: ' + data });
    }).catch(err => this.showError(err));
  },
  readDirNestedTest: function () {
    return RNFS.readDir(testDir1Path).then(files => {
      var text = files.map(file => file.name + ' (' + file.size + ') (' + (file.isDirectory() ? 'd' : 'f') + ')').join('\n');
      this.setState({ output: text });
    }).catch(err => this.showError(err));
  },
  deleteNestedTest: function () {
    return RNFS.unlink(testFile1Path).then(() => {
      this.setState({ output: 'Deleted' });
    }).catch(err => this.showError(err));
  },
  deleteDirTest: function () {
    return RNFS.unlink(testDir1Path).then(() => {
      this.setState({ output: 'Deleted' });
    }).catch(err => this.showError(err));
  },

  downloadFileTest: function (background, url) {
    var progress = data => {
      var percentage = data.bytesWritten / data.contentLength;
      var text = `Progress ${percentage}%`;
      this.setState({ output: text });
    };

    var begin = res => {
      jobId1 = res.jobId;
    };

    var progressDivider = 2;

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

  autoTest: function () {
    var f1 = RNFS.DocumentDirectoryPath + '/f1';

    return Promise.resolve().then(() => {
      return RNFS.unlink(f1).then(() => { }, () => void 0 /* Ignore error */);
    }).then(() => {
      return RNFS.exists(f1).then(exists => {
        this.assert('Should not exist', exists, false);
      });
    }).then(() => {
      return RNFS.writeFile(f1, 'foo © bar 𝌆 baz', 'utf8');
    }).then(() => {
      return RNFS.readdir(RNFS.DocumentDirectoryPath).then(files => {
        this.assert('F1 Visible', files.indexOf('f1') !== -1, true);
      });
    }).then(() => {
      return RNFS.exists(f1).then(exists => {
        this.assert('Should exist', exists, true);
      });
    }).then(() => {
      return RNFS.readFile(f1, 'utf8').then(contents => {
        this.assert('Read F1', contents, 'foo © bar 𝌆 baz');
      });
    }).then(() => {
      return RNFS.stat(f1).then(info => {
        this.assert('Stat', info.size, 19);
      });
    }).then(() => {
      return RNFS.writeFile(f1, '4piV4piC4piF', 'base64');
    }).then(() => {
      return RNFS.readFile(f1, 'base64').then(contents => {
        this.assert('Read F1', contents, '4piV4piC4piF');
      });
    }).then(() => {
      return RNFS.stat(f1).then(info => {
        this.assert('Stat', info.size, 9);
      });
    }).then(() => {
      return RNFS.unlink(f1);
    }).then(result => {
      return RNFS.readdir(RNFS.DocumentDirectoryPath).then(files => {
        this.assert('F1 Gone', files.indexOf('f1') === -1, true);
      });
    }).then(() => {
      this.assert('Tests Passed', true, true);
    }).catch(err => this.showError(err));
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
            <TouchableHighlight onPress={this.autoTest}>
              <View style={styles.button}>
                <Text style={styles.text}>Auto Test</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={this.appendTest}>
              <View style={styles.button}>
                <Text style={styles.text}>Append Test</Text>
              </View>
            </TouchableHighlight>

            <View style={styles.button}>
              <Text style={styles.text}>---</Text>
            </View>

            <TouchableHighlight onPress={this.mkdirTest}>
              <View style={styles.button}>
                <Text style={styles.text}>Make Dir</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={this.writeNestedTest}>
              <View style={styles.button}>
                <Text style={styles.text}>Write Nested</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={this.readNestedTest}>
              <View style={styles.button}>
                <Text style={styles.text}>Read Nested</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={this.readDirNestedTest}>
              <View style={styles.button}>
                <Text style={styles.text}>Read Dir</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={this.deleteNestedTest}>
              <View style={styles.button}>
                <Text style={styles.text}>Delete Nested</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={this.deleteDirTest}>
              <View style={styles.button}>
                <Text style={styles.text}>Delete Dir</Text>
              </View>
            </TouchableHighlight>

          </View>

          <View style={styles.rightPane}>

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

            <View style={styles.button}>
              <Text style={styles.text}>---</Text>
            </View>

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
