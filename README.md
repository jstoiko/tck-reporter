# TCK Reporter
TCK Reporter generates HTML reports for Test Compatibility Kits. This library was built and later generalized for use in [raml-org/raml-tck](https://github.com/raml-org/raml-tck) and [asyncapi/tck](https://github.com/asyncapi/tck) but can be used in any project.

## Installation
```sh
$ npm i -g  tck-reporter
```

## Usage
1. Generate JSON reports with tck runner (not provided in this repo).

2. Point `tck-reporter` to generated JSON reports directory and provide other required arguments/options:

```
Usage: tck-reporter [options] <jsonReportsDir> <outputHtmlDir>

Generate HTML reports from TCK JSON reports.

Options:
  --repoBranchUrl <url>  Github repo branch blob url. Is used to generate tck test files links. To produce valid links it
                         must have format: "https://github.com/USER/REPO/blob/BRANCH"
  -h, --help             display help for command
```

## Custom CSS
Pages look can be customize by writing custom CSS at `<outputHtmlDir>/static/user-styles.css`.

## Input JSON structure
The tool expects input JSON reports to be valid against the [report-schema.json](./src/report-schema.json) JSON Schema.

E.g.:

```json
{
  "parser": {
    "language": "go",
    "name": "jumpscale",
    "url": "https://github.com/Jumpscale/go-raml/tree/master/raml",
    "version": "0.1"
  },
  "results": [
    {
      "file": "/tests/raml-1.0/Root/version/invalid-version-structure.raml",
      "success": false,
      "error": "Error parsing RAML:\n  line 4: string value cannot be of type mapping, must be string\n"
    },
    {
      "file": "/tests/raml-1.0/Root/version/valid.raml",
      "success": true,
      "error": ""
    },
    ...
  ]
}
```
