const path = require('path')
const fs = require('fs-extra')
const Mustache = require('mustache')
const Ajv = require('ajv')

const ajv = new Ajv({ allErrors: true, schemaId: 'auto' })
const validate = ajv.compile(require('./report-schema.json'))

const TMPL_DIR = path.join(__dirname, '..', 'templates')

/* Runs all the logic */
function generateReports (jsonReportsDir, outputHtmlDir, opts) {
  if (!fs.existsSync(jsonReportsDir)) {
    throw new Error('JSON reports directory does not exist.')
  }
  if (!fs.existsSync(outputHtmlDir)) {
    fs.mkdirSync(outputHtmlDir)
  }
  const stats = []
  fs.readdirSync(jsonReportsDir).forEach(fpath => {
    if (!fpath.endsWith('.json')) {
      return
    }
    const fullPath = path.join(jsonReportsDir, fpath)
    console.log(`Processing report: ${fullPath}`)
    const report = JSON.parse(fs.readFileSync(fullPath))

    // Validate report agains tck report JSON Schema
    const valid = validate(report)
    if (!valid) {
      console.error(
        `Error: Invalid report "${fullPath}": ${validate.errors[0].message} ` +
        `(${validate.errors[0].dataPath})`)
      return
    }

    interpretReport(report, opts.repoBranchUrl)
    stats.push(composeReportStats(report))
    renderTemplate(
      report, 'detailed_report',
      `${report.parser.name}_${report.parser.language}_detailed_report`,
      outputHtmlDir)

    const featuresStats = composeFeaturesStats(report)
    renderTemplate(
      featuresStats, 'features_stats',
      `${report.parser.name}_${report.parser.language}_features_stats`,
      outputHtmlDir)
  })
  renderTemplate({ stats: stats }, 'index', 'index', outputHtmlDir)
  copyStaticFiles(outputHtmlDir)
}

/*
  * Inverts invalid files parsing results;
  * Composes repo url from relative file path;
  * Extracts "feature" name from file path;
*/
function interpretReport (report, repoBranchUrl) {
  report.results.forEach(result => {
    result.invalid = shouldFail(result.file)
    if (result.invalid) {
      delete result.error
      result.success = !result.success
      if (!result.success) {
        result.error = 'Parsing expected to fail but succeeded'
      }
    }
    result.file = result.file.startsWith('/')
      ? result.file.slice(1)
      : result.file
    result.fileUrl = repoBranchUrl
      ? `${repoBranchUrl}/${result.file}`
      : ''

    // Pick first 3 directories names as a feature name
    result.feature = path.dirname(result.file)
      .split('/').slice(0, 3).join('/')
  })
}

/*
  Composes single parser report stats:
    * number of successfully passed/total valid/invalid files tests;
    * % of passed files tests;
*/
function composeReportStats (report) {
  const stats = {
    parser: report.parser,
    valid: { success: 0, total: 0, successPerc: 0 },
    invalid: { success: 0, total: 0, successPerc: 0 },
    all: { success: 0, total: report.results.length, successPerc: 0 }
  }
  const invalid = report.results.filter(r => { return r.invalid })
  const invalidSuccess = invalid.filter(r => { return r.success })
  stats.invalid.total = invalid.length
  stats.invalid.success = invalidSuccess.length
  stats.invalid.successPerc = calculateSuccessPerc(stats.invalid)

  const valid = report.results.filter(r => { return !r.invalid })
  const validSuccess = valid.filter(r => { return r.success })
  stats.valid.total = valid.length
  stats.valid.success = validSuccess.length
  stats.valid.successPerc = calculateSuccessPerc(stats.valid)

  stats.all.success = invalidSuccess.length + validSuccess.length
  stats.all.successPerc = calculateSuccessPerc(stats.all)

  return stats
}

/* Calculates success percentage */
function calculateSuccessPerc (data) {
  let successPerc = Math.round((data.success / data.total) * 100)
  if (isNaN(successPerc)) {
    successPerc = 100
  }
  return successPerc
}

/*
  Composes single parser features report from an interpreted report.
  It includes features names and number of passed/all valid/invalid
  files for each parser.
*/
function composeFeaturesStats (report) {
  const frep = {
    parser: report.parser,
    stats: []
  }
  // Group by feature name
  const grouped = {}
  report.results.forEach(result => {
    if (grouped[result.feature] === undefined) {
      grouped[result.feature] = []
    }
    grouped[result.feature].push(result)
  })
  // Compose stats for each feature
  for (var featureName in grouped) {
    if (Object.prototype.hasOwnProperty.call(grouped, featureName)) {
      const stats = composeReportStats({
        parser: report.parser,
        results: grouped[featureName]
      })
      stats.feature = featureName
      frep.stats.push(stats)
    }
  }
  return frep
}

/* Renders single Mustache template with data and writes it to html file */
function renderTemplate (data, tmplName, htmlName, outputHtmlDir) {
  const inPath = path.join(TMPL_DIR, `${tmplName}.mustache`)
  const tmplStr = fs.readFileSync(inPath, 'utf-8')
  const htmlStr = Mustache.render(tmplStr, data)
  const outPath = path.join(outputHtmlDir, `${htmlName}.html`)
  fs.writeFileSync(outPath, htmlStr)
  console.log(`Rendered HTML: ${outPath}`)
}

/* Checks whether a file is expected to fail */
function shouldFail (fpath) {
  return fpath.toLowerCase().includes('invalid')
}

/** Copies static files needed for generated HTML page to look nice.
 *
 * @param outDir Generated HTML output directory.
 */
function copyStaticFiles (outDir) {
  const tmplStaticDir = path.join(TMPL_DIR, 'static')
  const outStaticDir = path.join(outDir, 'static')
  fs.ensureDirSync(outStaticDir)
  fs.copySync(tmplStaticDir, outStaticDir)
}

module.exports = {
  generateReports: generateReports
}
