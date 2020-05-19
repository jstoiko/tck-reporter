/* global describe, it, before */

const expect = require('chai').expect
const os = require('os')
const fs = require('fs-extra')
const path = require('path')
const generateReports = require('../../src/index').generateReports

describe('index.generateReports()', function () {
  const reportsDir = path.join(__dirname, '..', 'fixtures', 'json')
  const htmlDir = path.join(os.tmpdir(), 'html')
  before(function () {
    fs.emptyDirSync(htmlDir)
    const options = {
      repoBranchUrl: 'https://gitub.com/qwe/123/blob/feature_1'
    }
    generateReports(reportsDir, htmlDir, options)
  })
  it('should generate necessary html pages', function () {
    const files = fs.readdirSync(htmlDir).filter(x => x.endsWith('.html'))
    files.sort()
    expect(files).to.deep.equal([
      'index.html',
      'webapi-parser_js_detailed_report.html',
      'webapi-parser_js_features_stats.html'
    ])
  })
  it('should copy static files', function () {
    const staticDir = path.join(htmlDir, 'static')
    const files = fs.readdirSync(staticDir)
    files.sort()
    expect(files).to.deep.equal([
      'bootstrap.min.css',
      'custom.css'
    ])
  })
  it('should generate proper index page', function () {
    const pagePath = path.join(htmlDir, 'index.html')
    const html = fs.readFileSync(pagePath).toString()
    const expected = [
      'static/bootstrap.min.css',
      'static/custom.css',
      'static/user-styles.css',
      'Overview',
      'Valid Files',
      'Invalid Files',
      'Optional Files',
      'Total',
      'webapi-parser (js, ^0.5.0)',
      'https://github.com/raml-org/webapi-parser',
      '75%', '67%', '50%',
      '(3/4)', '(1/2)', '(4/6)', '(2/3)',
      'webapi-parser_js_detailed_report.html',
      'webapi-parser_js_features_stats.html'
    ]
    expected.forEach(s => expect(html).to.have.string(s))
  })
  it('should generate proper detailed report page', function () {
    const pagePath = path.join(
      htmlDir, 'webapi-parser_js_detailed_report.html')
    const html = fs.readFileSync(pagePath).toString()
    const expected = [
      'Detailed report: webapi-parser (js, ^0.5.0)',
      'static/bootstrap.min.css',
      'static/custom.css',
      'static/user-styles.css',
      'File', 'Success', 'Yes', 'No',
      '(Optional)',
      'invalid-version-structure.raml',
      'invalid-something.raml',
      'valid.raml',
      'Parsing expected to fail but succeeded',
      'Error: Included file not found',
      'Error: Unexpected key bye'
    ]
    expected.forEach(s => expect(html).to.have.string(s))
  })
  it('should generate proper features stats page', function () {
    const pagePath = path.join(
      htmlDir, 'webapi-parser_js_features_stats.html')
    const html = fs.readFileSync(pagePath).toString()
    const expected = [
      'Features stats: webapi-parser (js, ^0.5.0)',
      'static/bootstrap.min.css',
      'static/custom.css',
      'static/user-styles.css',
      'Feature',
      'Invalid Files',
      'Valid Files',
      'Optional Files',
      'Total'
    ]
    expected.forEach(s => expect(html).to.have.string(s))
  })
})
