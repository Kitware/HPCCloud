#! /usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    program = require('commander'),
    paraview = process.env.PARAVIEW_HOME;

require('shelljs/global');

program
  .version('1.0.0')
  .option('-p, --port [8080]', 'Start web server with given port', 8080)
  .option('-s, --server-only', 'Do not open the web browser\n')

  .parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
    process.exit(0);
}



