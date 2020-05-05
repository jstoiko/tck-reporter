#!/usr/bin/env node
const program = require('commander')
const lib = require('../src/index.js')

program
  .arguments('<jsonReportsDir> <outputHtmlDir>')
  .option(
    '--repoBranchUrl <url>',
    'Github repo branch blob url. Is used to generate tck test files links. ' +
    'To produce valid links it must have format: ' +
    '"https://github.com/USER/REPO/blob/BRANCH"')
  .description('Generate HTML reports from TCK JSON reports.')
  .action(lib.generateReports)

program.parse(process.argv)
