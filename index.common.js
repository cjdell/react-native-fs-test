/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
} = React;

var RNFS = require('react-native-fs');

var testFile1Path = RNFS.DocumentDirectoryPath + '/test-file-1';
var testFile2Path = RNFS.DocumentDirectoryPath + '/test-file-2';

var RNFSApp = React.createClass({
  getInitialState: function() {
    return { output: '' };
  },
  writeTest: function() {
    return Promise.all([
      RNFS.writeFile(testFile1Path, 'I am the first file', {}),
      RNFS.writeFile(testFile2Path, 'I am the second file', {})
    ]).then(() => {
      this.setState({ output: 'Files written successfully' });
    }).catch(err => this.showError(err));
  },
  readTest: function() {
    return RNFS.readFile(testFile1Path).then((data) => {
      this.setState({ output: 'Contents: ' + data });
    }).catch(err => this.showError(err));
  },
  readDirTest: function() {
    return RNFS.readDir('/', RNFS.DocumentDirectory).then(files => {
      var text = files.map(file => file.name).join('\n');
      this.setState({ output: text });
    }).catch(err => this.showError(err));
  },
  statTest: function() {
    return RNFS.stat(testFile1Path).then(stat => {
      var text = 'mtime: ' + stat.mtime + '\nsize: ' + stat.size + '\nisFile: ' + stat.isFile() + '\nisDirectory: ' + stat.isDirectory();
      this.setState({ output: text });
    }).catch(err => this.showError(err));
  },
  deleteTest: function() {
    return RNFS.unlink(testFile1Path).then(success => {
      var text = success.toString();
      this.setState({ output: text });
    }).catch(err => this.showError(err));
  },
  showError: function(err) {
    this.setState({ output: err.message });
  },
  render: function() {
    return (
      <View style={styles.container}>

        <TouchableHighlight onPress={this.writeTest}>
          <View style={styles.button}>
            <Text style={styles.text}>Write Test</Text>
          </View>
        </TouchableHighlight>

        <TouchableHighlight onPress={this.readTest}>
          <View style={styles.button}>
            <Text style={styles.text}>Read Test</Text>
          </View>
        </TouchableHighlight>

        <TouchableHighlight onPress={this.readDirTest}>
          <View style={styles.button}>
            <Text style={styles.text}>Read Dir Test</Text>
          </View>
        </TouchableHighlight>

        <TouchableHighlight onPress={this.statTest}>
          <View style={styles.button}>
            <Text style={styles.text}>Stat Test</Text>
          </View>
        </TouchableHighlight>

        <TouchableHighlight onPress={this.deleteTest}>
          <View style={styles.button}>
            <Text style={styles.text}>Delete Test</Text>
          </View>
        </TouchableHighlight>

        <Text style={styles.text}>{this.state.output}</Text>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  button: {
    height: 48,
    backgroundColor: '#CCCCCC',
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});

AppRegistry.registerComponent('ReactNativeFSTest', () => RNFSApp);
