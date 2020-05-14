/* global describe, it */

const expect = require('chai').expect
const rewire = require('rewire')
const fs = require('fs-extra')
const path = require('path')
const index = rewire('../../src/index')

const FIXTURES_DIR = path.join(__dirname, '..', 'fixtures')

const TEST_PARSER_INFO = {
  name: 'webapi-parser',
  language: 'js',
  url: 'https://github.com/raml-org/webapi-parser',
  version: '^0.5.0'
}

describe('index.shouldFail()', function () {
  const shouldFail = index.__get__('shouldFail')
  it('should report if file with a particular filename is expected to fail', function () {
    expect(shouldFail('some-valid-test.yaml')).to.equal(false)
    expect(shouldFail('valid-something.txt')).to.equal(false)
    expect(shouldFail('invalid-something.txt')).to.equal(true)
    expect(shouldFail('some-invalid-test.foo')).to.equal(true)
  })
})

describe('index.isOptional()', function () {
  const isOptional = index.__get__('isOptional')
  it('should report if a particular tck test is optional', function () {
    expect(isOptional('some-valid-test-optional.yaml')).to.equal(true)
    expect(isOptional('valid-something.txt')).to.equal(false)
    expect(isOptional('some-invalid-test-optional.foo')).to.equal(true)
    expect(isOptional('invalid-something.txt')).to.equal(false)
  })
})

describe('index.interpretReport()', function () {
  const interpretReport = index.__get__('interpretReport')
  it('should interpret failed test status, compose repo url and feature name', function () {
    const report = JSON.parse(
      fs.readFileSync(
        path.join(FIXTURES_DIR, 'json', 'report.json')
      ).toString()
    )

    interpretReport(report, 'https://github.com/qwe/123')
    expect(report.parser).to.deep.equal(TEST_PARSER_INFO)
    expect(report.results).to.be.lengthOf(9)
    expect(report.results[0]).to.deep.equal({
      file: 'tests/raml-1.0/Something/version/invalid-version-structure.raml',
      success: true,
      optional: false,
      invalid: true,
      fileUrl: 'https://github.com/qwe/123/tests/raml-1.0/Something/version/invalid-version-structure.raml',
      feature: 'tests/raml-1.0/Something'
    }, 'Interpreted: Invalid tck test that failed')
    expect(report.results[1]).to.deep.equal({
      file: 'tests/raml-1.0/Root/title-04/invalid-something.raml',
      success: false,
      optional: false,
      invalid: true,
      error: 'Parsing expected to fail but succeeded',
      fileUrl: 'https://github.com/qwe/123/tests/raml-1.0/Root/title-04/invalid-something.raml',
      feature: 'tests/raml-1.0/Root'
    }, 'Interpreted: Invalid tck test that did not fail')
    expect(report.results[2]).to.deep.equal({
      file: 'tests/raml-1.0/Root/version/valid.raml',
      success: true,
      optional: false,
      invalid: false,
      fileUrl: 'https://github.com/qwe/123/tests/raml-1.0/Root/version/valid.raml',
      feature: 'tests/raml-1.0/Root'
    }, 'Interpreted: Valid tck test that passed')
    expect(report.results[3]).to.deep.equal({
      file: 'tests/raml-1.0/Title/something/valid.raml',
      success: true,
      optional: false,
      invalid: false,
      fileUrl: 'https://github.com/qwe/123/tests/raml-1.0/Title/something/valid.raml',
      feature: 'tests/raml-1.0/Title'
    }, 'Interpreted: Valid tck test that passed')
    expect(report.results[4]).to.deep.equal({
      file: 'tests/raml-1.0/Root/another-one/valid.raml',
      success: true,
      optional: false,
      invalid: false,
      fileUrl: 'https://github.com/qwe/123/tests/raml-1.0/Root/another-one/valid.raml',
      feature: 'tests/raml-1.0/Root'
    }, 'Interpreted: Valid tck test that passed')
    expect(report.results[5]).to.deep.equal({
      file: 'tests/raml-1.0/Methods/title-04/valid-included.raml',
      success: false,
      optional: false,
      error: 'Error: Included file not found',
      invalid: false,
      fileUrl: 'https://github.com/qwe/123/tests/raml-1.0/Methods/title-04/valid-included.raml',
      feature: 'tests/raml-1.0/Methods'
    }, 'Interpreted: Valid tck test that failed')
    expect(report.results[6]).to.deep.equal({
      file: 'tests/raml-1.0/Something/version/invalid-version-structure-optional.raml',
      success: true,
      invalid: true,
      optional: true,
      fileUrl: 'https://github.com/qwe/123/tests/raml-1.0/Something/version/invalid-version-structure-optional.raml',
      feature: 'tests/raml-1.0/Something'
    }, 'Interpreted: Invalid optional test that failed')
    expect(report.results[7]).to.deep.equal({
      file: 'tests/raml-1.0/Root/title-04/valid-optional-something.raml',
      success: false,
      error: 'Error: Unexpected key bye',
      invalid: false,
      optional: true,
      fileUrl: 'https://github.com/qwe/123/tests/raml-1.0/Root/title-04/valid-optional-something.raml',
      feature: 'tests/raml-1.0/Root'
    }, 'Interpreted: Valid optional test that failed')
    expect(report.results[8]).to.deep.equal({
      file: 'tests/raml-1.0/Root/title-04/valid-optional-something-more.raml',
      success: true,
      invalid: false,
      optional: true,
      fileUrl: 'https://github.com/qwe/123/tests/raml-1.0/Root/title-04/valid-optional-something-more.raml',
      feature: 'tests/raml-1.0/Root'
    }, 'Interpreted: Valid optional test that passed')
  })
})

describe('index.composeReportStats()', function () {
  const composeReportStats = index.__get__('composeReportStats')
  it('should compose single parser report stats', function () {
    const report = JSON.parse(
      fs.readFileSync(
        path.join(FIXTURES_DIR, 'report-interpreted.json')
      ).toString()
    )
    const stats = composeReportStats(report)
    expect(stats).to.deep.equal({
      parser: TEST_PARSER_INFO,
      valid: { success: 3, total: 4, successPerc: 75 },
      invalid: { success: 1, total: 2, successPerc: 50 },
      optional: { success: 2, total: 3, successPerc: 67 },
      all: { success: 4, total: 6, successPerc: 67 }
    })
  })
})

describe('index.calculateSuccessPerc()', function () {
  const calculateSuccessPerc = index.__get__('calculateSuccessPerc')
  it('should calculate success percentage of a particular data', function () {
    expect(calculateSuccessPerc({ success: 1, total: 4 })).to.equal(25)
    expect(calculateSuccessPerc({ success: 2, total: 4 })).to.equal(50)
    expect(calculateSuccessPerc({ success: 1, total: 3 })).to.equal(33)
  })
})

describe('index.composeFeaturesStats()', function () {
  const composeFeaturesStats = index.__get__('composeFeaturesStats')
  it('should compose single parser features report from an interpreted report', function () {
    const report = JSON.parse(
      fs.readFileSync(
        path.join(FIXTURES_DIR, 'report-interpreted.json')
      ).toString()
    )
    const stats = composeFeaturesStats(report)
    expect(stats.parser).to.deep.equal(TEST_PARSER_INFO)
    expect(stats.stats).to.be.lengthOf(4)
    expect(stats.stats[0]).to.deep.equal({
      parser: TEST_PARSER_INFO,
      valid: { success: 0, total: 0, successPerc: 100 },
      invalid: { success: 1, total: 1, successPerc: 100 },
      all: { success: 1, total: 1, successPerc: 100 },
      optional: { success: 1, total: 1, successPerc: 100 },
      feature: 'tests/raml-1.0/Something'
    })
    expect(stats.stats[1]).to.deep.equal({
      parser: TEST_PARSER_INFO,
      valid: { success: 2, total: 2, successPerc: 100 },
      invalid: { success: 0, total: 1, successPerc: 0 },
      all: { success: 2, total: 3, successPerc: 67 },
      optional: { success: 1, total: 2, successPerc: 50 },
      feature: 'tests/raml-1.0/Root'
    })
    expect(stats.stats[2]).to.deep.equal({
      parser: TEST_PARSER_INFO,
      valid: { success: 1, total: 1, successPerc: 100 },
      invalid: { success: 0, total: 0, successPerc: 100 },
      all: { success: 1, total: 1, successPerc: 100 },
      optional: { success: 0, total: 0, successPerc: 100 },
      feature: 'tests/raml-1.0/Title'
    })
    expect(stats.stats[3]).to.deep.equal({
      parser: TEST_PARSER_INFO,
      valid: { success: 0, total: 1, successPerc: 0 },
      invalid: { success: 0, total: 0, successPerc: 100 },
      all: { success: 0, total: 1, successPerc: 0 },
      optional: { success: 0, total: 0, successPerc: 100 },
      feature: 'tests/raml-1.0/Methods'
    })
  })
})
