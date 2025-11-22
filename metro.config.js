// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix file watcher permission issues by excluding problematic directories
config.watchFolders = config.watchFolders || [];
config.resolver = {
  ...config.resolver,
  blockList: [
    // Block Android Studio directories that cause permission errors
    /.*\\AppData\\Local\\Google\\AndroidStudio.*/,
    /.*\/AppData\/Local\/Google\/AndroidStudio.*/,
  ],
};

module.exports = config;

