#!/bin/bash

cp -a node_modules/react-native-fs/FS.common.js ../react-native-fs/
cp -a node_modules/react-native-fs/*.[mh] ../react-native-fs/
cp -a node_modules/react-native-fs/android/src/main/java/com/rnfs/*.java ../react-native-fs/android/src/main/java/com/rnfs/
