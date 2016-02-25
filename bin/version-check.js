#! /usr/bin/env node

var version = process.versions.node.split('.').map(Number);
if (version[0] > 0 || version[0] === 0 && version[1] >= 12) {
    process.exit(0);
}

console.log('incompatible version, HPC-Cloud requires >=0.12.0 ');
process.exit(1);
