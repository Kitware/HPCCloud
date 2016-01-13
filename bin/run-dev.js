#! /usr/bin/env node

require('shelljs/global');

var path = require('path'),
    tonicPath = path.join(__dirname, '../../..'),
    arcticNodeModulesPath = path.join(__dirname, '../node_modules'),
    tonicList = require(path.join(tonicPath, 'bin', 'tonic-suite.json'));

// Index components
tonicList.forEach(function(tonicItem) {
    // Only with tonic-components
    if(tonicItem.path == 'tonic-components') {
        // Remove Arctic tonic libs
        rm('-rf', path.join(arcticNodeModulesPath, tonicItem.name, 'lib'));

        // Copy dev lib
        cp('-r', path.join(tonicPath, tonicItem.path, tonicItem.name, 'lib'), path.join(arcticNodeModulesPath, tonicItem.name));
    }
});

// Build new viewer
exec('npm run build');

// Run local code base
var cmd = [ path.join(__dirname, 'hpc-cloud-cli.js'), '-sd' ];
for (var i = 2; i < process.argv.length; i++) {
    cmd.push(process.argv[i]);
}
exec(cmd.join(' '));

